(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Local clock: runs in the visitor's own timezone.
  const clock = document.getElementById('local-clock');
  const updateClock = () => {
    if (clock) clock.textContent = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(new Date());
  };
  updateClock();
  setInterval(updateClock, 1000);

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Subtle pointer glow.
  const glow = document.querySelector('.mouse-glow');
  if (glow && !reduceMotion) {
    window.addEventListener('pointermove', (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  // Scroll reveal.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  // Animated background particles.
  const canvas = document.getElementById('particle-canvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, particles = [];
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(52, Math.floor(width / 26));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
        r: Math.random() * 1.4 + .4, a: Math.random() * .36 + .12
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(73, 185, 255, ${p.a})`;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j], dx = p.x - q.x, dy = p.y - q.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 105) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(55, 155, 230, ${.075 * (1 - distance / 105)})`;
            ctx.lineWidth = .6; ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', resize, { passive: true });
  }

  // Rotating current-interest line.
  const interest = document.getElementById('rotating-interest');
  const interests = ['Large Language Models', 'AI & Machine Learning', 'System Design', 'Intelligent Software'];
  let interestIndex = 0;
  if (interest && !reduceMotion) {
    setInterval(() => {
      interest.style.opacity = '0';
      setTimeout(() => {
        interestIndex = (interestIndex + 1) % interests.length;
        interest.textContent = interests[interestIndex];
        interest.style.opacity = '1';
      }, 220);
    }, 2600);
    interest.style.transition = 'opacity .22s ease';
  }

  // Interactive terminal.
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const commandHelp = 'Available commands: help, about, skills, focus, principles, contact, clear';
  const commands = {
    help: () => commandHelp,
    about: () => 'Sadegh Sharbaf | Software Developer with 3+ years of experience. Backend engineering is my foundation; AI integration is an area I am actively exploring.',
    skills: () => 'Python · Django · Django REST Framework · PostgreSQL · Redis · Celery · Docker · Git',
    focus: () => 'Backend Engineering / Software Architecture / AI Integration / Data & Systems',
    principles: () => '01 Understand deeply\n02 Build intentionally\n03 Keep questioning',
    contact: () => 'GitHub: github.com/SadeghSharbaf\\nTelegram: t.me/sadeghsgalaxy',
    clear: () => '__CLEAR__'
  };
  function appendTerminalLine(text, className = 'terminal-result') {
    const line = document.createElement('p');
    line.className = className;
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
  function runCommand(raw) {
    const value = raw.trim().toLowerCase();
    if (!value) return;
    appendTerminalLine(`visitor@sadegh:~$ ${raw}`, 'terminal-command');
    if (value === 'clear') {
      terminalOutput.innerHTML = '';
      appendTerminalLine('Terminal cleared. Type "help" to continue.', 'terminal-muted');
      return;
    }
    if (commands[value]) appendTerminalLine(commands[value]());
    else appendTerminalLine(`Command not found: ${raw}. Type "help" to see available commands.`, 'terminal-error');
  }
  if (terminalForm && terminalInput && terminalOutput) {
    terminalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      runCommand(terminalInput.value);
      terminalInput.value = '';
    });
    document.querySelectorAll('[data-command]').forEach((button) => {
      button.addEventListener('click', () => {
        runCommand(button.dataset.command);
        terminalInput.focus();
      });
    });
  }

  // Three-question developer mini game.
  const questions = [
    {
      category: 'PYTHON BASICS', question: 'What does bool([]) return in Python?',
      options: ['True', 'False', 'None'], answer: 1,
      explanation: 'An empty list is falsy in Python, so bool([]) returns False.'
    },
    {
      category: 'PYTHON OPERATORS', question: 'What is the result of 2 ** 3 ** 2?',
      options: ['64', '512', '256'], answer: 1,
      explanation: 'Exponentiation is right-associative: 2 ** (3 ** 2) = 512.'
    },
    {
      category: 'SOFTWARE THINKING', question: 'Which quality helps a system stay easy to change over time?',
      options: ['More dependencies', 'Tighter coupling', 'Modularity'], answer: 2,
      explanation: 'Modularity creates clearer boundaries and makes change easier to manage.'
    }
  ];
  const questionEl = document.getElementById('game-question');
  const optionsEl = document.getElementById('game-options');
  const feedbackEl = document.getElementById('game-feedback');
  const nextButton = document.getElementById('game-next');
  const scoreEl = document.getElementById('game-score');
  const progressBar = document.getElementById('game-progress-bar');
  const progressText = document.getElementById('game-progress-text');
  const categoryEl = document.getElementById('game-category');
  const levelEl = document.getElementById('game-level');
  let questionIndex = 0, score = 0, answered = false, finished = false;

  function renderQuestion() {
    const q = questions[questionIndex];
    answered = false;
    categoryEl.textContent = q.category;
    levelEl.textContent = String(questionIndex + 1).padStart(2, '0');
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    q.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'game-option';
      button.innerHTML = `<span>${String.fromCharCode(65 + index)}</span>`;
      button.appendChild(document.createTextNode(option));
      button.addEventListener('click', () => chooseAnswer(index));
      optionsEl.appendChild(button);
    });
    feedbackEl.textContent = 'Choose your answer to continue.';
    feedbackEl.className = 'game-feedback';
    nextButton.disabled = true;
    nextButton.textContent = questionIndex === questions.length - 1 ? 'See result →' : 'Next question →';
    progressText.textContent = `QUESTION ${String(questionIndex + 1).padStart(2, '0')} / 03`;
    progressBar.style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
  }

  function chooseAnswer(selected) {
    if (answered) return;
    answered = true;
    const q = questions[questionIndex];
    const buttons = [...optionsEl.querySelectorAll('button')];
    buttons.forEach((button, index) => {
      button.disabled = true;
      if (index === q.answer) button.classList.add('correct');
      if (index === selected && selected !== q.answer) button.classList.add('wrong');
    });
    if (selected === q.answer) {
      score += 1;
      feedbackEl.textContent = `Correct! ${q.explanation}`;
      feedbackEl.classList.add('success');
    } else {
      feedbackEl.textContent = `Not quite. ${q.explanation}`;
      feedbackEl.classList.add('error');
    }
    scoreEl.textContent = String(score).padStart(2, '0');
    nextButton.disabled = false;
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (finished) {
        questionIndex = 0;
        score = 0;
        scoreEl.textContent = '00';
        renderQuestion();
        return;
      }
      if (!answered) return;
      if (questionIndex < questions.length - 1) {
        questionIndex += 1;
        renderQuestion();
      } else {
        finished = true;
        questionEl.textContent = `You scored ${score} out of 3.`;
        optionsEl.innerHTML = '';
        feedbackEl.textContent = score === 3
          ? 'Debugging Master. Excellent engineering instincts!'
          : score === 2
            ? 'Logic Explorer. Nice work — keep sharpening your thinking.'
            : 'Curious Beginner. Every great engineer keeps learning.';
        feedbackEl.className = 'game-feedback success';
        nextButton.textContent = 'Play again ↻';
        nextButton.disabled = false;
      }
    });
    renderQuestion();
  }
})();
