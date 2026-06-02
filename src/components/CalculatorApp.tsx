import { useState } from 'react';
import '../styles/calculator.css';

type Operator = '+' | '-' | '×' | '÷';

const MAX_DISPLAY_LENGTH = 16;
const MAX_DISPLAY_PRECISION = 10;

function formatValue(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  const asString = value.toString();
  if (asString.length <= MAX_DISPLAY_LENGTH) {
    return asString;
  }

  return Number(value.toPrecision(MAX_DISPLAY_PRECISION)).toString();
}

function computeResult(left: number, right: number, operator: Operator): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      if (right === 0) {
        return Number.NaN;
      }
      return left / right;
    default:
      return right;
  }
}

export function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [replaceDisplay, setReplaceDisplay] = useState(true);

  function resetCalculator() {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setReplaceDisplay(true);
  }

  function inputDigit(digit: string) {
    if (display === 'Error') {
      setDisplay(digit);
      setReplaceDisplay(false);
      return;
    }

    if (replaceDisplay) {
      setDisplay(digit);
      setReplaceDisplay(false);
      return;
    }

    if (display.length >= MAX_DISPLAY_LENGTH) {
      return;
    }

    setDisplay(display === '0' ? digit : `${display}${digit}`);
  }

  function inputDecimal() {
    if (display === 'Error') {
      setDisplay('0.');
      setReplaceDisplay(false);
      return;
    }

    if (replaceDisplay) {
      setDisplay('0.');
      setReplaceDisplay(false);
      return;
    }

    if (display.includes('.')) {
      return;
    }

    setDisplay(`${display}.`);
  }

  function setNextOperator(nextOperator: Operator) {
    const currentValue = Number.parseFloat(display);
    if (Number.isNaN(currentValue)) {
      return;
    }

    if (firstOperand !== null && operator && !replaceDisplay) {
      const result = computeResult(firstOperand, currentValue, operator);
      if (!Number.isFinite(result)) {
        setDisplay('Error');
        setFirstOperand(null);
        setOperator(null);
        setReplaceDisplay(true);
        return;
      }

      const formatted = formatValue(result);
      setDisplay(formatted);
      setFirstOperand(result);
    } else if (firstOperand === null) {
      setFirstOperand(currentValue);
    }

    setOperator(nextOperator);
    setReplaceDisplay(true);
  }

  function evaluate() {
    if (firstOperand === null || !operator) {
      return;
    }

    const currentValue = Number.parseFloat(display);
    if (Number.isNaN(currentValue)) {
      return;
    }

    const result = computeResult(firstOperand, currentValue, operator);
    if (!Number.isFinite(result)) {
      setDisplay('Error');
      setFirstOperand(null);
      setOperator(null);
      setReplaceDisplay(true);
      return;
    }

    const formatted = formatValue(result);
    setDisplay(formatted);
    setFirstOperand(null);
    setOperator(null);
    setReplaceDisplay(true);
  }

  function toggleSign() {
    if (display === '0' || display === 'Error') {
      return;
    }

    setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`);
  }

  function applyPercent() {
    if (display === 'Error') {
      return;
    }

    const value = Number.parseFloat(display);
    if (Number.isNaN(value)) {
      return;
    }

    setDisplay(formatValue(value / 100));
    setReplaceDisplay(true);
  }

  function backspace() {
    if (replaceDisplay || display === 'Error') {
      setDisplay('0');
      setReplaceDisplay(true);
      return;
    }

    if (display.length === 1 || (display.startsWith('-') && display.length === 2)) {
      setDisplay('0');
      return;
    }

    setDisplay(display.slice(0, -1));
  }

  return (
    <main className="calculator-desktop">
      <section className="calculator-window">
        <header className="calculator-window__header">
          <h1>Calculator</h1>
        </header>
        <div className="calculator-window__display" aria-live="polite">
          {display}
        </div>
        <div className="calculator-grid">
          <button type="button" className="key key--utility" onClick={resetCalculator}>
            C
          </button>
          <button type="button" className="key key--utility" onClick={toggleSign}>
            ±
          </button>
          <button type="button" className="key key--utility" onClick={applyPercent}>
            %
          </button>
          <button type="button" className="key key--operator" onClick={() => setNextOperator('÷')}>
            ÷
          </button>

          <button type="button" className="key" onClick={() => inputDigit('7')}>
            7
          </button>
          <button type="button" className="key" onClick={() => inputDigit('8')}>
            8
          </button>
          <button type="button" className="key" onClick={() => inputDigit('9')}>
            9
          </button>
          <button type="button" className="key key--operator" onClick={() => setNextOperator('×')}>
            ×
          </button>

          <button type="button" className="key" onClick={() => inputDigit('4')}>
            4
          </button>
          <button type="button" className="key" onClick={() => inputDigit('5')}>
            5
          </button>
          <button type="button" className="key" onClick={() => inputDigit('6')}>
            6
          </button>
          <button type="button" className="key key--operator" onClick={() => setNextOperator('-')}>
            -
          </button>

          <button type="button" className="key" onClick={() => inputDigit('1')}>
            1
          </button>
          <button type="button" className="key" onClick={() => inputDigit('2')}>
            2
          </button>
          <button type="button" className="key" onClick={() => inputDigit('3')}>
            3
          </button>
          <button type="button" className="key key--operator" onClick={() => setNextOperator('+')}>
            +
          </button>

          <button type="button" className="key key--wide" onClick={() => inputDigit('0')}>
            0
          </button>
          <button type="button" className="key" onClick={inputDecimal}>
            .
          </button>
          <button type="button" className="key key--action" onClick={evaluate}>
            =
          </button>
        </div>
        <button type="button" className="calculator-window__backspace" onClick={backspace}>
          ⌫
        </button>
      </section>
    </main>
  );
}
