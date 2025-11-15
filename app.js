// ============================================================
// VIBE QUIZ MASTER - Main Application
// ============================================================

// Global State
const state = {
    pdfText: '',
    questions: [],
    currentQuestion: 0,
    userAnswers: [],
    score: 0,
    startTime: null,
    endTime: null,
    quizConfig: {
        type: 'mcq',
        difficulty: 'medium',
        numQuestions: 10,
        timeLimit: 15
    },
    gamification: {
        totalScore: parseInt(localStorage.getItem('totalScore')) || 0,
        level: parseInt(localStorage.getItem('level')) || 1,
        streak: parseInt(localStorage.getItem('streak')) || 0,
        badges: JSON.parse(localStorage.getItem('badges')) || []
    }
};

// ============================================================
// PDF EXTRACTION
// ============================================================

document.getElementById('uploadBox').addEventListener('dragover', (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#667eea';
});

document.getElementById('uploadBox').addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) handlePdfUpload(files[0]);
});

document.getElementById('pdfInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) handlePdfUpload(e.target.files[0]);
});

async function handlePdfUpload(file) {
    if (!file.name.endsWith('.pdf')) {
        alert('Please upload a PDF file');
        return;
    }

    showLoadingSpinner(true);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        state.pdfText = fullText;
        displayExtractedContent(fullText);
        // Extract topics from the PDF text using compromise (NLP)
        try {
            const topics = extractTopicsFromText(fullText);
            populateTopicList(topics);
        } catch (e) {
            console.warn('Topic extraction failed:', e);
        }
        showLoadingSpinner(false);
    } catch (error) {
        console.error('PDF extraction error:', error);
        alert('Error extracting PDF content. Please try another file.');
        showLoadingSpinner(false);
    }
}

function displayExtractedContent(text) {
    const preview = text.substring(0, 500) + (text.length > 500 ? '...' : '');
    document.getElementById('contentPreview').textContent = preview;
    document.getElementById('extractedContent').style.display = 'block';
    // show topic selection container once we have content
    const topicDiv = document.getElementById('topicSelection');
    if (topicDiv) topicDiv.style.display = 'block';
}

// ------------------ Topic extraction & UI ------------------
function extractTopicsFromText(text) {
    // Use compromise to find nouns, people, places, and common noun phrases
    const doc = nlp(text || '');
    // Get top nouns and named entities
    const nouns = doc.nouns().out('frequency');
    const people = doc.people().out('frequency');
    const places = doc.places().out('frequency');

    // Merge and rank by count
    const freqMap = new Map();
    function addList(list) {
        for (const item of list) {
            const t = (item.normal || item.text || item).toString();
            const count = item.count || 1;
            freqMap.set(t, (freqMap.get(t) || 0) + count);
        }
    }

    addList(nouns);
    addList(people);
    addList(places);

    // Convert map to sorted array of topics
    const topics = Array.from(freqMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(x => x[0])
        .filter(t => t && t.length > 2);

    // Return top 12 topics
    return topics.slice(0, 12);
}

function populateTopicList(topics) {
    const list = document.getElementById('topicList');
    if (!list) return;
    list.innerHTML = '';
    if (!topics || topics.length === 0) {
        list.innerHTML = '<div style="color:#666">No clear topics found — defaulting to whole document.</div>';
        return;
    }

    topics.forEach((t, i) => {
        const id = `topic_${i}`;
        const card = document.createElement('label');
        card.className = 'option-card';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.gap = '0.5rem';
        card.style.cursor = 'pointer';
        card.innerHTML = `\n            <input type="checkbox" id="${id}" name="extractedTopic" value="${escapeHtml(t)}">\n            <div class="option-content" style="padding:0.5rem 0.75rem; border-radius:6px; border:1px solid #e6e6e6">${t}</div>\n        `;
        list.appendChild(card);
    });
}

function selectTopTopics() {
    // select first 3 topics if available
    const boxes = document.querySelectorAll('input[name="extractedTopic"]');
    boxes.forEach((b, idx) => { b.checked = idx < 3; });
}

function collectSelectedTopicsAndContinue() {
    const boxes = document.querySelectorAll('input[name="extractedTopic"]:checked');
    state.selectedTopics = Array.from(boxes).map(b => b.value);
    // if none selected, default to empty => means whole doc
    if (!state.selectedTopics || state.selectedTopics.length === 0) state.selectedTopics = [];
    goToPage('quizSetup');
}

function getSelectedTopics() {
    return state.selectedTopics || [];
}

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// ============================================================
// QUIZ QUESTION GENERATION
// ============================================================

async function generateQuestions() {
    const config = state.quizConfig;
    const text = state.pdfText;

    if (!text) {
        alert('Please upload a PDF first');
        return;
    }

    showLoadingSpinner(true);

    try {
        // Simulate API call to generate questions
        // In production, this would call an AI service like OpenAI
        state.questions = generateQuestionsLocally(text, config);
        showLoadingSpinner(false);
        return true;
    } catch (error) {
        console.error('Question generation error:', error);
        alert('Error generating questions');
        showLoadingSpinner(false);
        return false;
    }
}

function generateQuestionsLocally(text, config) {
    const questions = [];
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);

    // Build a corpus noun list for distractors using compromise
    let corpusNouns = [];
    try {
        const doc = nlp(text || '');
        corpusNouns = Array.from(new Set(doc.nouns().out('array').map(n => n.trim()).filter(n => n.length > 1)));
    } catch (e) {
        corpusNouns = [];
    }

    // Filter sentences by selected topics if user chose topics
    const selectedTopics = getSelectedTopics();
    let candidateSentences = sentences;
    if (selectedTopics && selectedTopics.length > 0) {
        const lowered = selectedTopics.map(t => t.toLowerCase());
        candidateSentences = sentences.filter(s => lowered.some(t => s.toLowerCase().includes(t)));
        if (candidateSentences.length === 0) {
            // fallback to whole document if no sentences matched
            candidateSentences = sentences;
        }
    }

    for (let i = 0; i < config.numQuestions && i < candidateSentences.length; i++) {
        const sentence = candidateSentences[Math.floor(Math.random() * candidateSentences.length)].trim();

        if (config.type === 'mcq') {
            questions.push(generateMCQFromSentence(sentence, corpusNouns, config.difficulty));
        } else if (config.type === 'flashcard') {
            questions.push(generateFlashcardQuestion(sentence));
        } else if (config.type === 'coding') {
            questions.push(generateCodingQuestion(config.difficulty));
        } else if (config.type === 'numerical') {
            questions.push(generateNumericalQuestion(config.difficulty));
        }
    }

    return questions;
}

function generateMCQFromSentence(sentence, corpusNouns = [], difficulty) {
    // Prefer named entity or noun phrase as answer using compromise
    let answer = null;
    try {
        const doc = nlp(sentence);
        // try people, places, then nouns
        const people = doc.people().out('array');
        const places = doc.places().out('array');
        const nouns = doc.nouns().out('array');
        if (people.length) answer = people[0];
        else if (places.length) answer = places[0];
        else if (nouns.length) {
            // choose the longest noun phrase
            answer = nouns.sort((a, b) => b.length - a.length)[0];
        }
    } catch (e) {
        // fallback
        const parts = sentence.split(' ').filter(w => w.length > 3);
        answer = parts.length ? parts[Math.floor(Math.random() * parts.length)] : null;
    }

    if (!answer) {
        // fallback to trivial question
        return {
            type: 'mcq',
            question: sentence.substring(0, 120) || 'Choose the best answer',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            difficulty: difficulty
        };
    }

    // Build distractors: sample other nouns from corpusNouns
    const other = corpusNouns.filter(n => n.toLowerCase() !== answer.toLowerCase());
    const distractors = [];
    while (distractors.length < 3 && other.length) {
        const idx = Math.floor(Math.random() * other.length);
        const pick = other.splice(idx, 1)[0];
        if (pick && pick.toLowerCase() !== answer.toLowerCase()) distractors.push(pick);
    }

    // If not enough distractors, create variations
    while (distractors.length < 3) {
        const variation = answer.length > 6 ? answer.slice(0, Math.max(3, Math.floor(answer.length * 0.6))) : answer + 's';
        if (!distractors.includes(variation) && variation.toLowerCase() !== answer.toLowerCase()) distractors.push(variation);
        if (distractors.length >= 3) break;
        distractors.push((Math.random() + 1).toString().slice(2, 6));
    }

    const options = [answer, ...distractors].slice(0, 4).sort(() => Math.random() - 0.5);
    const maskedQuestion = sentence.replace(new RegExp(escapeRegExp(answer), 'i'), '______').substring(0, 200);

    return {
        type: 'mcq',
        question: maskedQuestion || sentence.substring(0, 150),
        options: options,
        correctAnswer: answer,
        difficulty: difficulty
    };
}

function generateFlashcardQuestion(sentence) {
    return {
        type: 'flashcard',
        front: 'Based on the PDF content, complete this:',
        back: sentence.substring(0, 100),
        difficulty: 'medium'
    };
}

function extractProgrammingConcepts(text) {
    // Look for programming-related keywords in the PDF
    const programmingKeywords = [
        'array', 'list', 'tree', 'graph', 'sort', 'search', 'algorithm',
        'recursion', 'loop', 'function', 'class', 'object', 'string',
        'hash', 'stack', 'queue', 'binary', 'traverse', 'iterate',
        'palindrome', 'substring', 'matrix', 'sequence', 'fibonacci',
        'permutation', 'combination', 'dynamic programming', 'dp',
        'greedy', 'backtracking', 'bfs', 'dfs', 'linked list',
        'heap', 'trie', 'hash table', 'dictionary', 'set'
    ];
    
    const foundConcepts = [];
    const lowerText = text.toLowerCase();
    
    for (const keyword of programmingKeywords) {
        if (lowerText.includes(keyword)) {
            foundConcepts.push(keyword);
        }
    }
    
    return [...new Set(foundConcepts)]; // Remove duplicates
}

function generateCodingQuestion(difficulty, pdfText = '') {
    // Check if PDF has programming content
    const programmingConcepts = extractProgrammingConcepts(pdfText || state.pdfText || '');
    
    // If no programming concepts found, return a special "not applicable" question
    if (programmingConcepts.length === 0) {
        return {
            type: 'coding',
            question: 'ℹ️ No Programming Content Detected',
            template: 'This PDF does not appear to contain programming-related content.\n\nTo generate coding challenges, please upload a PDF about:\n• Data Structures\n• Algorithms\n• Programming Languages\n• Software Engineering\n• Computer Science\n\nOtherwise, focus on the MCQ and Flashcard quizzes!',
            testCases: [],
            isNotApplicable: true
        };
    }
    
    // Generate coding challenges based on found concepts
    const concept = programmingConcepts[Math.floor(Math.random() * programmingConcepts.length)];
    const challenges = {
        'array': {
            question: 'Write a function to reverse an array',
            template: 'function reverseArray(arr) {\n  // Reverse the array in-place or return new array\n  // Example: [1,2,3] -> [3,2,1]\n}',
            testCases: [
                { input: [1, 2, 3], expected: [3, 2, 1] },
                { input: [5], expected: [5] }
            ]
        },
        'list': {
            question: 'Write a function to find the maximum element in a list',
            template: 'function findMax(list) {\n  // Return the maximum element\n}',
            testCases: [
                { input: [3, 1, 4, 1, 5], expected: 5 },
                { input: [-10, -5, -1], expected: -1 }
            ]
        },
        'sort': {
            question: 'Write a function to sort an array in ascending order',
            template: 'function sortAscending(arr) {\n  // Sort array in ascending order\n}',
            testCases: [
                { input: [3, 1, 4, 1, 5], expected: [1, 1, 3, 4, 5] },
                { input: [5, 2, 8, 1], expected: [1, 2, 5, 8] }
            ]
        },
        'search': {
            question: 'Write a function to find the index of a target value in an array',
            template: 'function findIndex(arr, target) {\n  // Return index of target, or -1 if not found\n}',
            testCases: [
                { input: { arr: [1, 2, 3, 4, 5], target: 3 }, expected: 2 },
                { input: { arr: [1, 2, 3], target: 10 }, expected: -1 }
            ]
        },
        'string': {
            question: 'Write a function to check if a string is a palindrome',
            template: 'function isPalindrome(s) {\n  // Return true if string reads same forwards and backwards\n}',
            testCases: [
                { input: 'racecar', expected: true },
                { input: 'hello', expected: false }
            ]
        },
        'fibonacci': {
            question: 'Write a function to generate the nth Fibonacci number',
            template: 'function fibonacci(n) {\n  // Return the nth Fibonacci number\n  // F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)\n}',
            testCases: [
                { input: 0, expected: 0 },
                { input: 6, expected: 8 }
            ]
        },
        'recursion': {
            question: 'Write a recursive function to calculate the sum of digits in a number',
            template: 'function sumOfDigits(n) {\n  // Use recursion to sum all digits\n  // Example: 123 -> 1+2+3 = 6\n}',
            testCases: [
                { input: 123, expected: 6 },
                { input: 999, expected: 27 }
            ]
        },
        'hash': {
            question: 'Write a function to find two numbers that sum to a target',
            template: 'function findPair(arr, target) {\n  // Return array of two numbers that sum to target\n  // Or null if not found\n}',
            testCases: [
                { input: { arr: [1, 2, 3, 6], target: 9 }, expected: [3, 6] },
                { input: { arr: [1, 2], target: 5 }, expected: null }
            ]
        },
        'tree': {
            question: 'Write a function to check if a number is a perfect square',
            template: 'function isPerfectSquare(n) {\n  // Return true if n is a perfect square\n}',
            testCases: [
                { input: 16, expected: true },
                { input: 17, expected: false }
            ]
        },
        'matrix': {
            question: 'Write a function to transpose a 2D matrix',
            template: 'function transposeMatrix(matrix) {\n  // Return the transpose of the matrix\n  // Swap rows and columns\n}',
            testCases: [
                { input: [[1, 2], [3, 4]], expected: [[1, 3], [2, 4]] }
            ]
        },
        'palindrome': {
            question: 'Write a function to check if a number is a palindrome',
            template: 'function isPalindromeNumber(n) {\n  // Check if number reads same forwards and backwards\n}',
            testCases: [
                { input: 121, expected: true },
                { input: 123, expected: false }
            ]
        },
        'substring': {
            question: 'Write a function to find the longest common prefix of strings',
            template: 'function longestCommonPrefix(strs) {\n  // Find the longest common prefix\n}',
            testCases: [
                { input: ["flower","flow","flight"], expected: "fl" },
                { input: ["dog","racecar","car"], expected: "" }
            ]
        }
    };
    
    // If concept is in challenges, use it; otherwise pick a random challenge
    if (challenges[concept]) {
        return {
            type: 'coding',
            question: challenges[concept].question,
            template: challenges[concept].template,
            testCases: challenges[concept].testCases,
            concept: concept
        };
    }
    
    // Fallback to random challenge
    const fallback = Object.values(challenges);
    const selected = fallback[Math.floor(Math.random() * fallback.length)];
    return {
        type: 'coding',
        question: selected.question,
        template: selected.template,
        testCases: selected.testCases,
        concept: 'general'
    };
}

function generateNumericalQuestion(difficulty) {
    const num1 = Math.floor(Math.random() * 100) + 1;
    const num2 = Math.floor(Math.random() * 100) + 1;
    const operations = ['+', '-', '*', '/'];
    const op = operations[Math.floor(Math.random() * operations.length)];

    let answer;
    if (op === '+') answer = num1 + num2;
    else if (op === '-') answer = num1 - num2;
    else if (op === '*') answer = num1 * num2;
    else answer = (num1 / num2).toFixed(2);

    return {
        type: 'numerical',
        question: `What is ${num1} ${op} ${num2}?`,
        answer: answer,
        difficulty: difficulty
    };
}

// ============================================================
// QUIZ RENDERING
// ============================================================

function renderMCQQuestion(question) {
    const optionsHtml = question.options.map((option, index) => `
        <label class="option">
            <input type="radio" name="mcq-option" value="${index}">
            <span>${option}</span>
        </label>
    `).join('');

    return `
        <div class="question-content">
            <h3 class="question-title">${question.question}</h3>
            <div class="options">${optionsHtml}</div>
        </div>
    `;
}

function renderFlashcardQuestion(question) {
    return `
        <div class="question-content">
            <div class="flashcard" id="flashcard" onclick="toggleFlashcard()">
                <div class="flashcard-front">
                    <div>${question.front}</div>
                    <div class="flashcard-hint">Click to reveal answer</div>
                </div>
                <div class="flashcard-back">
                    <div>${question.back}</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 1rem;">
                <label class="option">
                    <input type="checkbox" name="flashcard-understood">
                    <span>I understood this concept</span>
                </label>
            </div>
        </div>
    `;
}

function renderCodingQuestion(question) {
    // Handle "not applicable" case when PDF has no programming content
    if (question.isNotApplicable) {
        return `
            <div class="question-content">
                <h3 class="question-title">${question.question}</h3>
                <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 1.5rem; border-radius: 4px; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333;">
                    ${question.template}
                </div>
                <div style="margin-top: 1rem; text-align: center;">
                    <p style="color: #666; font-size: 0.9rem;">Coding challenges require a programming-related PDF. Continue with MCQ or Flashcard quizzes instead!</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="question-content">
            <h3 class="question-title">${question.question}</h3>
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">📚 Generated from PDF: <strong>${question.concept || 'programming content'}</strong></div>
            <div class="coding-container">
                <div>
                    <label>Write Your Code:</label>
                    <div class="code-editor">
                        <textarea id="codeInput" placeholder="Write your JavaScript code here...">${question.template}</textarea>
                    </div>
                </div>
                <div>
                    <label>Output:</label>
                    <div class="code-output" id="codeOutput">Run your code to see output</div>
                    <button class="btn btn-secondary" onclick="runCode()" style="margin-top: 1rem; width: 100%;">Run Code</button>
                </div>
            </div>
        </div>
    `;
}

function renderNumericalQuestion(question) {
    return `
        <div class="question-content">
            <h3 class="question-title">${question.question}</h3>
            <input type="number" id="numericalInput" class="numerical-input" placeholder="Enter your answer" step="any">
        </div>
    `;
}

function displayQuestion() {
    const question = state.questions[state.currentQuestion];
    let html = '';

    if (question.type === 'mcq') {
        html = renderMCQQuestion(question);
    } else if (question.type === 'flashcard') {
        html = renderFlashcardQuestion(question);
    } else if (question.type === 'coding') {
        html = renderCodingQuestion(question);
    } else if (question.type === 'numerical') {
        html = renderNumericalQuestion(question);
    }

    document.getElementById(`${question.type}Content`).innerHTML = html;

    // Update progress
    document.getElementById('questionNumber').textContent = state.currentQuestion + 1;
    document.getElementById('totalQuestions').textContent = state.questions.length;

    // Update button visibility
    document.getElementById('prevBtn').style.display = state.currentQuestion > 0 ? 'block' : 'none';
    document.getElementById('submitBtn').style.display = state.currentQuestion === state.questions.length - 1 ? 'block' : 'none';
}

// ============================================================
// QUIZ ACTIONS
// ============================================================

async function startQuiz() {
    state.quizConfig = {
        type: document.querySelector('input[name="quizType"]:checked').value,
        difficulty: document.getElementById('difficulty').value,
        numQuestions: parseInt(document.getElementById('numQuestions').value),
        timeLimit: parseInt(document.getElementById('timeLimit').value)
    };

    if (await generateQuestions()) {
        state.currentQuestion = 0;
        state.userAnswers = new Array(state.questions.length).fill(null);
        state.score = 0;
        state.startTime = Date.now();

        showQuizPage();
        displayQuestion();
        startTimer();
    }
}

function toggleFlashcard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');
}

function runCode() {
    const code = document.getElementById('codeInput').value;
    const output = document.getElementById('codeOutput');

    try {
        const result = eval(code);
        output.textContent = result || 'Code executed successfully';
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    }
}

function nextQuestion() {
    saveCurrentAnswer();

    if (state.currentQuestion < state.questions.length - 1) {
        state.currentQuestion++;
        showQuizType();
        displayQuestion();
    }
}

function previousQuestion() {
    if (state.currentQuestion > 0) {
        state.currentQuestion--;
        showQuizType();
        displayQuestion();
    }
}

function saveCurrentAnswer() {
    const question = state.questions[state.currentQuestion];

    if (question.type === 'mcq') {
        const selected = document.querySelector('input[name="mcq-option"]:checked');
        if (selected) {
            const optionIndex = parseInt(selected.value);
            state.userAnswers[state.currentQuestion] = question.options[optionIndex];
        }
    } else if (question.type === 'flashcard') {
        const understood = document.querySelector('input[name="flashcard-understood"]:checked');
        state.userAnswers[state.currentQuestion] = understood ? 'understood' : 'not-understood';
    } else if (question.type === 'coding') {
        state.userAnswers[state.currentQuestion] = document.getElementById('codeInput').value;
    } else if (question.type === 'numerical') {
        state.userAnswers[state.currentQuestion] = document.getElementById('numericalInput').value;
    }
}

function submitQuiz() {
    saveCurrentAnswer();
    clearInterval(window.timerInterval);
    state.endTime = Date.now();

    calculateScore();
    updateGamification();
    showResultsPage();
}

// ============================================================
// SCORING & VERIFICATION
// ============================================================

function calculateScore() {
    let correct = 0;
    const reviews = [];

    state.questions.forEach((question, index) => {
        const userAnswer = state.userAnswers[index];
        let isCorrect = false;

        if (question.type === 'mcq') {
            isCorrect = userAnswer === question.correctAnswer;
        } else if (question.type === 'flashcard') {
            isCorrect = userAnswer === 'understood';
        } else if (question.type === 'numerical') {
            isCorrect = parseFloat(userAnswer) === parseFloat(question.answer);
        } else if (question.type === 'coding') {
            isCorrect = true; // Manual verification
        }

        if (isCorrect) correct++;

        reviews.push({
            question: question.question || question.front,
            userAnswer: userAnswer,
            correctAnswer: question.correctAnswer || question.answer || 'Manual Review',
            isCorrect: isCorrect
        });
    });

    state.score = Math.round((correct / state.questions.length) * 100);
    window.reviewData = reviews;
}

function updateGamification() {
    state.gamification.totalScore += state.score;
    
    // Calculate streak
    if (state.score >= 70) {
        state.gamification.streak++;
    } else {
        state.gamification.streak = 0;
    }

    // Calculate level
    state.gamification.level = Math.floor(state.gamification.totalScore / 500) + 1;

    // Award badges
    awardBadges();

    // Save to localStorage
    localStorage.setItem('totalScore', state.gamification.totalScore);
    localStorage.setItem('level', state.gamification.level);
    localStorage.setItem('streak', state.gamification.streak);
    localStorage.setItem('badges', JSON.stringify(state.gamification.badges));

    updateNavStats();
}

function awardBadges() {
    if (state.score === 100 && !state.gamification.badges.includes('Perfect')) {
        state.gamification.badges.push('Perfect');
    }
    if (state.score >= 80 && !state.gamification.badges.includes('Great')) {
        state.gamification.badges.push('Great');
    }
    if (state.gamification.streak >= 3 && !state.gamification.badges.includes('On Fire')) {
        state.gamification.badges.push('On Fire');
    }
    if (state.gamification.level >= 5 && !state.gamification.badges.includes('Expert')) {
        state.gamification.badges.push('Expert');
    }
}

// ============================================================
// TIMER
// ============================================================

function startTimer() {
    let timeLeft = state.quizConfig.timeLimit * 60;

    window.timerInterval = setInterval(() => {
        timeLeft--;

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(window.timerInterval);
            submitQuiz();
        }
    }, 1000);
}

// ============================================================
// PAGE NAVIGATION
// ============================================================

function goToPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageName).classList.add('active');
}

function showQuizType() {
    const quizType = state.quizConfig.type;
    document.querySelectorAll('.quiz-type').forEach(type => type.classList.remove('active'));
    document.getElementById(`${quizType}Quiz`).classList.add('active');
}

function showQuizPage() {
    goToPage('quiz');
    showQuizType();
}

function showResultsPage() {
    const timeTaken = formatTime(state.endTime - state.startTime);
    const correct = window.reviewData.filter(r => r.isCorrect).length;
    const incorrect = window.reviewData.length - correct;

    document.getElementById('finalScore').textContent = state.score;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('incorrectCount').textContent = incorrect;
    document.getElementById('timeTaken').textContent = timeTaken;

    // Display achievements
    const achievementHtml = getAchievementHtml();
    document.getElementById('achievementBox').innerHTML = achievementHtml;

    // Display review
    displayReview();

    goToPage('results');
}

function displayReview() {
    const reviewHtml = window.reviewData.map((item, index) => `
        <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
            <div class="review-title">Q${index + 1}: ${item.question}</div>
            <div class="review-your-answer">Your Answer: ${item.userAnswer || 'No answer'}</div>
            <div class="review-correct-answer">Correct Answer: ${item.correctAnswer}</div>
        </div>
    `).join('');

    document.querySelector('.review-section').innerHTML = reviewHtml;
}

function getAchievementHtml() {
    let html = '';

    if (state.score === 100) {
        html += '<div class="achievement">🏅 Perfect Score!</div>';
    }
    if (state.gamification.streak >= 3) {
        html += `<div class="achievement">🔥 ${state.gamification.streak} Quiz Streak!</div>`;
    }
    if (state.gamification.level > 1) {
        html += `<div class="achievement">⭐ Level ${state.gamification.level}</div>`;
    }

    return html || '<div class="achievement">Great effort! Keep practicing!</div>';
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function retakeQuiz() {
    goToPage('quizSetup');
}

function viewLeaderboard() {
    displayLeaderboard();
    goToPage('leaderboard');
}

function displayLeaderboard() {
    const leaderboardData = [
        { rank: 1, name: 'Quiz Master', score: state.gamification.totalScore, quizzes: 15 },
        { rank: 2, name: 'You', score: state.gamification.totalScore, quizzes: Math.floor(state.gamification.level) },
        { rank: 3, name: 'Top Learner', score: state.gamification.totalScore - 100, quizzes: 20 },
        { rank: 4, name: 'Knowledge Seeker', score: state.gamification.totalScore - 200, quizzes: 10 },
        { rank: 5, name: 'Dedicated Student', score: state.gamification.totalScore - 300, quizzes: 25 }
    ];

    const html = leaderboardData.map(entry => `
        <div class="leaderboard-entry">
            <div class="leaderboard-rank">#${entry.rank}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${entry.name}</div>
                <div class="leaderboard-stats">${entry.quizzes} quizzes completed</div>
            </div>
            <div class="leaderboard-score">${entry.score}</div>
        </div>
    `).join('');

    document.getElementById('leaderboardTable').innerHTML = html;
}

// ============================================================
// UTILITIES
// ============================================================

function showLoadingSpinner(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

function updateNavStats() {
    document.getElementById('navScore').textContent = state.gamification.totalScore;
    document.getElementById('navLevel').textContent = state.gamification.level;
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Set up number input listener
    const numQuestionsInput = document.getElementById('numQuestions');
    numQuestionsInput.addEventListener('input', (e) => {
        document.getElementById('questionCount').textContent = e.target.value;
    });

    // Update nav stats on load
    updateNavStats();
});

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener('keydown', (e) => {
    // Ignore shortcuts when user is typing in inputs/textareas or contenteditable
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

    if (document.getElementById('quiz').classList.contains('active')) {
        if (e.key === 'ArrowRight') nextQuestion();
        if (e.key === 'ArrowLeft') previousQuestion();
        if (e.key === 'Enter' && document.getElementById('submitBtn').style.display === 'block') {
            submitQuiz();
        }
    }
});
