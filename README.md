# 🎯 Vibe Quiz Master

A powerful, interactive online quiz web application that extracts content from PDFs and generates customizable quizzes with multiple question types, gamification, and real-time feedback.

## ✨ Features

### 📄 PDF Processing
- **Drag & Drop Upload**: Easily upload PDF files with intuitive drag-and-drop interface
- **Smart Extraction**: Automatically extracts and processes text content from PDFs
- **Content Preview**: Preview extracted content before generating quizzes

### 🎨 Multiple Quiz Types
1. **Multiple Choice Questions (MCQ)**: Traditional multiple-choice format with instant feedback
2. **Flashcards**: Interactive flip cards for concept mastery
3. **Coding Challenges**: Write and test code directly in the browser
4. **Numerical Problems**: Math and calculation-based questions

### 🎮 Gamification System
- **Scoring System**: Earn points based on quiz performance
- **Levels**: Progress through levels as you accumulate points
- **Streaks**: Build consecutive correct quiz streaks for bonuses
- **Badges**: Unlock achievements like "Perfect Score", "On Fire", and "Expert"
- **Leaderboard**: Compare scores with other users

### ⚡ User Experience
- **Beautiful Animations**: Smooth transitions and engaging visual effects
- **Real-time Timer**: Monitor quiz time with countdown timer
- **Progress Tracking**: Track your progress through questions
- **Responsive Design**: Fully responsive on desktop, tablet, and mobile
- **Keyboard Shortcuts**: Navigate with arrow keys and Enter

### 📊 Quiz Results
- **Comprehensive Review**: Detailed review of all questions and answers
- **Performance Metrics**: Score percentage, correct/incorrect counts, time taken
- **Achievements**: Visual celebration of accomplishments
- **Statistics**: Track your learning progress

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required!

### How to Use

1. **Visit the Application**: Open `index.html` in your web browser

2. **Upload PDF**:
   - Click "Get Started" on the landing page
   - Drag and drop a PDF or click "Browse Files"
   - Preview the extracted content

3. **Configure Quiz**:
   - Select quiz type (MCQ, Flashcard, Coding, or Numerical)
   - Choose difficulty level (Easy, Medium, Hard)
   - Set number of questions (5-50)
   - Set time limit (1-120 minutes)

4. **Take Quiz**:
   - Answer questions following the format
   - Use arrow keys to navigate or click buttons
   - Watch your score update in real-time

5. **Review Results**:
   - See your final score and statistics
   - View detailed question review
   - Check earned achievements
   - Compare with leaderboard

## 📁 Project Structure

```
Vibe/
├── index.html          # Main HTML file with all page sections
├── styles.css          # Comprehensive styling with animations
├── app.js              # Main application logic
├── README.md           # This file
└── .gitignore          # Git ignore file
```

## 🛠️ Technology Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with animations and gradients
- **Vanilla JavaScript**: No framework dependencies
- **PDF.js**: PDF text extraction
- **LocalStorage**: Persistent score and badge tracking

## 📱 Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: Below 768px

## 🎯 Quiz Generation

### MCQ Questions
- Automatically generated from PDF content
- Multiple choice options with one correct answer
- Instant feedback on selection

### Flashcards
- Front shows question from PDF content
- Back reveals answer
- Interactive flip animation

### Coding Challenges
- JavaScript code execution environment
- Real-time output display
- Test case validation

### Numerical Problems
- Math and calculation questions
- Numeric input with decimal support
- Automatic grading

## 🏆 Gamification Features

| Feature | Description |
|---------|-------------|
| **Points** | Earn points based on quiz score |
| **Levels** | Level up every 500 points |
| **Streaks** | Build consecutive correct quiz streaks |
| **Badges** | Perfect, Great, On Fire, Expert |
| **Leaderboard** | Global ranking system |

## 🔑 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Right Arrow | Next Question |
| Left Arrow | Previous Question |
| Enter | Submit Quiz (on last question) |

## 📊 Local Storage

User data is stored locally in browser:
- Total Score
- Current Level
- Streak Count
- Earned Badges

## 🌐 Deployment on GitHub Pages

1. **Fork the Repository** (if using from GitHub)
2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Select Main branch as source
   - Save
3. **Access Your Site**: `https://yourusername.github.io/Vibe`

## 🎨 Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
    /* ... more colors */
}
```

### Question Difficulty
Modify difficulty factors in `app.js`:
```javascript
difficulty: 'easy' | 'medium' | 'hard'
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| PDF not uploading | Ensure file is valid PDF format and under 50MB |
| Questions not generating | Check if PDF has extractable text content |
| Timer not working | Refresh page and start quiz again |
| Scores not saving | Enable cookies/LocalStorage in browser settings |

## 🔒 Privacy

- All data is stored locally in your browser
- No server uploads or cloud storage
- No tracking or analytics
- Complete privacy and offline capability

## 📝 Notes

- Question generation is local and based on PDF content
- For AI-powered question generation, integrate with OpenAI API
- Coding challenges support JavaScript by default
- Numerical problems with auto-grading for most cases

## 🚀 Future Enhancements

- [ ] AI-powered intelligent question generation
- [ ] Multiple language support
- [ ] Timed practice mode
- [ ] Question difficulty adjustment
- [ ] Cloud synchronization
- [ ] Social sharing features
- [ ] Mobile app version
- [ ] Video tutorials integration

## 📄 License

Open source and free to use.

## 👨‍💻 Developer Notes

Built with vanilla JavaScript for maximum compatibility and minimal dependencies. The application is fully self-contained and can run offline after initial load.

---

**Happy Learning with Vibe Quiz Master! 🎯**
