import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showBonus, setShowBonus] = useState(false);
  const [bonusSelected, setBonusSelected] = useState(null);
  const [bonusAnswered, setBonusAnswered] = useState(false);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [incorrectIndex, setIncorrectIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bonusQuestion = {
    question: "BONUS: The Pythagorean Theorem is a² + b² = c². Solve for c if a=3 and b=4.",
    choices: ["5", "6", "7", "8"],
    answer: 0,
    worth: 2,
    penalty: 1,
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('https://opentdb.com/api.php?amount=20&category=9&difficulty=easy&type=multiple');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if (data.response_code !== 0) {
          throw new Error('No questions returned from API. Response code: ' + data.response_code);
        }

        // Transform each question into our desired format
        let fetchedQuestions = data.results.map((q, index) => {
          const incorrect = q.incorrect_answers;
          const correct = q.correct_answer;
          const allChoices = [...incorrect];
          const correctPos = Math.floor(Math.random() * 4);
          allChoices.splice(correctPos, 0, correct);

          return {
            id: index + 1,
            question: decodeHTML(q.question),
            choices: allChoices.map(answer => decodeHTML(answer)),
            answer: correctPos,
          };
        });

        setQuestions(fetchedQuestions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setFeedback("");
    setCorrectIndex(null);
    setIncorrectIndex(null);
  }, [currentIndex]);

  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const handleAnswerSelection = (index) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (selectedAnswer === null) return;
    const currentQuestion = questions[currentIndex];
    const correct = currentQuestion.answer;
    if (selectedAnswer === correct) {
      setFeedback("Correct!");
      setScore((prevScore) => prevScore + 1);
      setCorrectIndex(correct);
    } else {
      setFeedback(
        `Incorrect. The correct answer is "${currentQuestion.choices[correct]}".`
      );
      setIncorrectIndex(selectedAnswer);
      setCorrectIndex(correct);
    }
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowBonus(true);
    }
  };

  const handleBonusAnswerSelection = (index) => {
    if (bonusAnswered) return;
    setBonusSelected(index);
  };

  const handleBonusSubmit = (e) => {
    e.preventDefault();
    if (bonusSelected === null) return;
    if (bonusSelected === bonusQuestion.answer) {
      setScore((prevScore) => prevScore + bonusQuestion.worth);
      setFeedback("Bonus correct! +2 points!");
      setCorrectIndex(bonusQuestion.answer);
    } else {
      setScore((prevScore) => prevScore - bonusQuestion.penalty);
      setFeedback(
        `Bonus incorrect. Correct answer is "${bonusQuestion.choices[bonusQuestion.answer]}". -1 point.`
      );
      setIncorrectIndex(bonusSelected);
      setCorrectIndex(bonusQuestion.answer);
    }
    setBonusAnswered(true);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setFeedback("");
    setShowBonus(false);
    setBonusSelected(null);
    setBonusAnswered(false);
    setCorrectIndex(null);
    setIncorrectIndex(null);
  };

  if (loading) {
    return (
      <div className="container">
        <h1 className="title">Loading Questions...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1 className="title">Error Loading Questions</h1>
        <p>{error}</p>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  return (
    <div className="container">
      <h1 className="title">React Quiz App</h1>
      {!showBonus && (
        <div className="quiz-container">
          <div className="score-display">Score: {score}</div>
          <h2 className="question-header">
            Question {currentIndex + 1} of {totalQuestions}
          </h2>
          <p className="question-text">{currentQuestion.question}</p>
          <form onSubmit={handleSubmitAnswer}>
            <div className="options-wrapper">
              {currentQuestion.choices.map((choice, i) => {
                let className = "choice";
                if (isAnswered) {
                  if (i === correctIndex) {
                    className += " correct";
                  } else if (i === incorrectIndex) {
                    className += " incorrect";
                  }
                }
                return (
                  <label key={i} className={className}>
                    <input
                      type="radio"
                      value={i}
                      checked={selectedAnswer === i}
                      onChange={() => handleAnswerSelection(i)}
                      disabled={isAnswered}
                    />
                    {choice}
                  </label>
                );
              })}
            </div>
            {!isAnswered && (
              <button type="submit" className="submit-button">
                Submit
              </button>
            )}
          </form>
          {isAnswered && (
            <div className="feedback">
              <p>{feedback}</p>
              {currentIndex < totalQuestions - 1 && (
                <button onClick={handleNextQuestion} className="next-button">
                  Next Question
                </button>
              )}
              {currentIndex === totalQuestions - 1 && (
                <button onClick={() => setShowBonus(true)} className="next-button">
                  Proceed to Bonus
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showBonus && (
        <div className="quiz-container">
          {!bonusAnswered && (
            <>
              <h2 className="question-header">Bonus Question (Optional)</h2>
              <p className="question-text">{bonusQuestion.question}</p>
              <form onSubmit={handleBonusSubmit}>
                <div className="options-wrapper">
                  {bonusQuestion.choices.map((choice, i) => {
                    let className = "choice";
                    if (bonusAnswered) {
                      if (i === bonusQuestion.answer) {
                        className += " correct";
                      } else if (i === bonusSelected && i !== bonusQuestion.answer) {
                        className += " incorrect";
                      }
                    }
                    return (
                      <label key={i} className={className}>
                        <input
                          type="radio"
                          value={i}
                          checked={bonusSelected === i}
                          onChange={() => handleBonusAnswerSelection(i)}
                          disabled={bonusAnswered}
                        />
                        {choice}
                      </label>
                    );
                  })}
                </div>
                <button type="submit" className="submit-button">
                  Submit Bonus Answer
                </button>
              </form>
            </>
          )}
          {bonusAnswered && (
            <>
              <div className="feedback"><p>{feedback}</p></div>
              <div className="final-score">
                <h3>Your Final Score: {score}</h3>
                <button onClick={resetQuiz} className="submit-button">Play Again</button>
              </div>
            </>
          )}

          {bonusAnswered === false && currentIndex === totalQuestions && bonusSelected === null && (
            <div className="final-score">
              <h3>Your Score: {score}</h3>
              <button onClick={resetQuiz} className="submit-button">Play Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
