import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import styles from "./index.module.css";
import outputStyles from "./output.module.css";

export default function Home() {
  const [plantInput, setPlantInput] = useState("");
  const [result, setResult] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const previousAnswerRef = useRef("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Add the "bg-image" class to the body element
    document.body.classList.add("bg-image");

    // Remove the "bg-image" class from the body element when the component unmounts
    return () => {
      document.body.classList.remove("bg-image");
    };
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plant: plantInput }),
      });
      document.body.style.backgroundImage = "url('/growbot.jpg')";
  
      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      if (data.result !== previousAnswerRef.current) {
        const newChatLog = [...chatLog, { question: plantInput, answer: data.result }];
        setChatLog(newChatLog);
      }
      setResult(data.result);
      setPlantInput("");
      previousAnswerRef.current = data.result;
      } catch (error) {
        // Consider implementing your own error handling logic here
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
      }
      
      const chatLogEndRef = useRef(null);
      useEffect(() => {
        chatLogEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, [chatLog]);
      
      async function handleProvideFeedback(question, providedResponse) {
        const feedback = prompt(`Was the response to "${question}" correct? (y/n)`);
        const data = { response: providedResponse, question, feedback };
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        console.log("Feedback sent");
      }
      
      return (
        <div>
          <Head>
            <title>Gary The Growbot</title>
            <link rel="icon" href="/gary1.png" />
          </Head>
          <main className={styles.main}>
            <img src="/gary1.png" className={styles.icon} />
            <h3>Gary The Grower</h3>
            <div className={styles.chatContainer}>
              <div className={styles.chatLog} id="chatlog">
                {chatLog.map((item, index) => (
                  <div key={index} className={styles.chatMessage}>
                    <div className={styles.question}>{item.question}</div>
                    <div className={styles.answerContainer}>
                      <div className={outputStyles.garyAnswer}>Gary: </div>
                      <div className={outputStyles.answer}>{item.answer}</div>
                      <button
                        className={styles.feedbackButton}
                        onClick={() => handleProvideFeedback(item.question, item.answer)}
                      >
                                                Provide Feedback
                      </button>
                    </div>
                  </div>
                ))}
                {result && result !== previousAnswerRef.current && (
                  <div className={styles.chatMessage}>
                    <div className={styles.question}>{plantInput}</div>
                    <div className={styles.answerContainer}>
                      <div className={outputStyles.garyAnswer}>Gary: </div>
                      <div className={outputStyles.answer}>{result}</div>
                      <button
                        className={styles.feedbackButton}
                        onClick={() => handleProvideFeedback(plantInput, result)}
                      >
                        Provide Feedback
                      </button>
                    </div>
                  </div>
                )}
                <div ref={chatLogEndRef}></div>
              </div>
              <div className={styles.chatFormContainer}>
                <form onSubmit={onSubmit} className={styles.chatForm}>
                  <input
                    type="text"
                    name="Gary The Grower"
                    placeholder="Enter Your Plant Question"
                    value={plantInput}
                    onChange={(e) => setPlantInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        onSubmit(e);
                      }
                    }}
                  />
                  <button type="submit" className={styles.chatButton} disabled={loading}>
                    {loading ? 'Loading...' : 'Ask Gary'}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      );
}
