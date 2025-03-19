import React, { useEffect, useRef } from 'react';
import './PiCalculator.css';

const PiCalculator = () => {
  const displayRef = useRef(null);
  const currentDigitsRef = useRef([]);
  const stableCountRef = useRef([]);
  const finalizedDigitsRef = useRef([]);
  const FINALIZATION_THRESHOLD = 20;

  const createDigitElement = (digit) => {
    const digitElement = document.createElement("div");
    digitElement.className = "digit";
    const innerElement = document.createElement("div");
    innerElement.className = "digit-inner";

    if (digit === ".") {
      const span = document.createElement("span");
      span.textContent = ".";
      span.style.border = "none";
      innerElement.appendChild(span);
    } else {
      for (let i = 0; i < 10; i++) {
        const span = document.createElement("span");
        span.textContent = i;
        innerElement.appendChild(span);
      }
    }

    digitElement.appendChild(innerElement);
    return digitElement;
  };

  const updatePiDisplay = (estimatedPi) => {
    const display = displayRef.current;
    if (!display) return;

    const piDigits = estimatedPi.toFixed(10).toString().split("");
    if (!piDigits.includes(".")) piDigits.splice(1, 0, ".");

    piDigits.forEach((digit, index) => {
      if (currentDigitsRef.current[index] === digit) {
        stableCountRef.current[index] = (stableCountRef.current[index] || 0) + 1;
        if (
          !finalizedDigitsRef.current[index] &&
          stableCountRef.current[index] >= FINALIZATION_THRESHOLD &&
          digit !== "."
        ) {
          finalizedDigitsRef.current[index] = true;
          display.children[index].style.color = "coral";
        }
      } else {
        stableCountRef.current[index] = 0;
        finalizedDigitsRef.current[index] = false;
        if (display.children[index] && digit !== ".") {
          display.children[index].style.color = "#61dafb";
        }
      }

      if (currentDigitsRef.current[index] !== digit) {
        if (!display.children[index]) {
          display.appendChild(createDigitElement(digit));
        }
        const digitElement = display.children[index].querySelector(".digit-inner");
        if (digit === ".") {
          digitElement.style.transform = "translateY(0)";
        } else {
          digitElement.style.transform = `translateY(-${digit * 30}px)`;
        }
      }
    });
    currentDigitsRef.current = piDigits;
  };

  useEffect(() => {
    let pi = 0;
    const iterations = 500000;

    const iterate = (k = 0) => {
      if (k < iterations) {
        pi += 4 * (Math.pow(-1, k) / (2 * k + 1));
        updatePiDisplay(pi);
        requestAnimationFrame(() => iterate(k + 1));
      }
    };

    iterate();
  }, []);

  return (
    <div className="pi-calculator">
      <h1>π</h1>
      <div ref={displayRef} className="pi-display"></div>
      <p className="pi-message">Unlike π, our encryption doesn't get cracked</p>
    </div>
  );
};

export default PiCalculator; 