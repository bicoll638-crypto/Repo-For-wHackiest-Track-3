const state = {
  storageKb: 142,
  readinessScore: 68,
  sleepHours: 5.7,
  steps: 4820,
  lateScreenHours: 2.3,
  isPlayingBriefing: false,
  isRecording: false,
  chartInstance: null,
  recognition: null,
  waveformAnimId: null,
  trendDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
  sleepHistory: [7.4, 6.8, 5.2, 7.1, 5.0, 5.4, 5.7],
  screenHistory: [0.9, 1.2, 2.8, 0.8, 3.1, 2.5, 2.3],
  timeline: [
    {
      id: 'evt-101',
      time: '07:15 AM',
      title: 'Morning Briefing Synthesized',
      desc: 'ElevenLabs generated 60-second recovery brief based on overnight health signals.',
      sanitized: true
    },
    {
      id: 'evt-102',
      time: '06:50 AM',
      title: 'Smartwatch Sleep OCR Ingested',
      desc: 'NoiseFit screenshot extracted: 5h 42m duration, 48 bpm resting heart rate.',
      sanitized: true
    },
    {
      id: 'evt-103',
      time: '12:45 AM',
      title: 'Late-Night Screen Exposure Flag',
      desc: 'Digital Wellbeing log parsed: 2.3 hrs phone activity past 10:30 PM.',
      sanitized: true
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  initChart();
  renderTimeline();
  updateReadinessUI();
  updateStorageUI();
  drawRestingWaveform();
  setupDragAndDrop();
  setupDemoTriggers();
  setupVoice();
  setupBriefingAudio();
  setupDataWipe();
});

function initChart() {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  state.chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: state.trendDays,
      datasets: [
        {
          label: 'Sleep Duration (hrs)',
          data: state.sleepHistory,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.15)',
          fill: true,
          tension: 0.35,
          yAxisID: 'y'
        },
        {
          label: 'Late-Night Screen (hrs)',
          data: state.screenHistory,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          borderDash: [5, 5],
          fill: false,
          tension: 0.35,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: '#94a3b8',
            font: { size: 11 }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { size: 10 } }
        },
        y: {
          type: 'linear',
          position: 'left',
          min: 0,
          max: 10,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#06b6d4', font: { size: 10 } }
        },
        y1: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 6,
          grid: { drawOnChartArea: false },
          ticks: { color: '#f43f5e', font: { size: 10 } }
        }
      }
    }
  });
}

function updateStorageUI() {
  const el = document.getElementById('storageIndicator');
  if (el) el.textContent = `Storage: ${state.storageKb} KB`;
}

function updateReadinessUI() {
  const scoreVal = document.getElementById('readinessScoreVal');
  const scoreCircle = document.getElementById('scoreCircle');
  const statusEl = document.getElementById('readinessStatus');
  const subEl = document.getElementById('readinessSub');
  const sleepEl = document.getElementById('sleepMetric');
  const stepsEl = document.getElementById('stepsMetric');
  const screenEl = document.getElementById('screenMetric');
  const correlationEl = document.getElementById('correlationText');
  const alertEl = document.getElementById('alertText');
  const briefingScriptEl = document.getElementById('briefingScript');

  if (scoreVal) scoreVal.textContent = Math.round(state.readinessScore);
  if (sleepEl) sleepEl.textContent = `${state.sleepHours.toFixed(1)} hrs`;
  if (stepsEl) stepsEl.textContent = state.steps.toLocaleString();
  if (screenEl) screenEl.textContent = `${state.lateScreenHours.toFixed(1)} hrs`;

  let statusText = 'Optimal Readiness';
  let color = '#10b981';

  if (state.readinessScore < 50) {
    statusText = 'Low Recovery Alert';
    color = '#f43f5e';
  } else if (state.readinessScore < 75) {
    statusText = 'Moderate Readiness';
    color = '#38bdf8';
  }

  if (scoreCircle) {
    scoreCircle.style.borderColor = color;
    scoreCircle.style.boxShadow = `0 0 20px ${color}55`;
  }
  if (statusEl) {
    statusEl.textContent = statusText;
    statusEl.style.color = color;
  }

  const screenImpactPct = Math.min(65, Math.round((state.lateScreenHours / 3) * 45));
  const insightMessage = `Late-night screen exposure (${state.lateScreenHours.toFixed(1)} hrs) correlates with a ${screenImpactPct}% drop in deep recovery sleep and lower morning cognitive focus.`;
  if (correlationEl) correlationEl.textContent = insightMessage;

  const targetBedtime = state.lateScreenHours > 1.5 ? '10:15 PM' : '11:00 PM';
  if (alertEl) {
    alertEl.textContent = `Put your phone away by ${targetBedtime} tonight to recover 45 minutes of accumulated sleep debt.`;
  }

  const script = `Good morning. Your readiness score is ${Math.round(state.readinessScore)} today. ${state.sleepHours.toFixed(1)} hours of sleep combined with ${state.lateScreenHours.toFixed(1)} hours of late night screen time indicates an opportunity to wind down earlier. Aim for lights out by ${targetBedtime} to restore full mental clarity.`;
  if (briefingScriptEl) briefingScriptEl.textContent = `"${script}"`;

  if (state.chartInstance) {
    state.sleepHistory[state.sleepHistory.length - 1] = state.sleepHours;
    state.screenHistory[state.screenHistory.length - 1] = state.lateScreenHours;
    state.chartInstance.update();
  }
}

function calculateReadiness() {
  const sleepFactor = Math.min(1, state.sleepHours / 8) * 50;
  const stepsFactor = Math.min(1, state.steps / 8000) * 30;
  const screenPenalty = Math.min(35, state.lateScreenHours * 12);
  const total = Math.max(20, Math.min(100, Math.round(sleepFactor + stepsFactor + 20 - screenPenalty)));
  state.readinessScore = total;
  updateReadinessUI();
}

function renderTimeline() {
  const container = document.getElementById('timelineStream');
  if (!container) return;

  container.innerHTML = '';
  state.timeline.forEach(item => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.innerHTML = `
      <div class="timeline-item-meta">
        <span>${item.time}</span>
        ${item.sanitized ? '<span class="timeline-badge">PII Redacted</span>' : ''}
      </div>
      <div class="timeline-item-title">${item.title}</div>
      <div class="timeline-item-desc">${item.desc}</div>
    `;
    container.appendChild(el);
  });
}

function addTimelineEvent(title, desc) {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.timeline.unshift({
    id: `evt-${Date.now()}`,
    time: timeString,
    title,
    desc,
    sanitized: true
  });
  renderTimeline();
}

function setPipelineStage(stageNum, status, isCompleted) {
  const step = document.getElementById(`stage${stageNum}`);
  const statusEl = document.getElementById(`stage${stageNum}Status`);
  if (!step || !statusEl) return;

  step.classList.remove('active', 'completed');
  if (isCompleted) {
    step.classList.add('completed');
  } else {
    step.classList.add('active');
  }
  statusEl.textContent = status;
}

function resetPipelineStages() {
  for (let i = 1; i <= 3; i++) {
    const step = document.getElementById(`stage${i}`);
    const statusEl = document.getElementById(`stage${i}Status`);
    if (step) step.classList.remove('active', 'completed');
    if (statusEl) statusEl.textContent = 'Idle';
  }
  const bar = document.getElementById('ocrProgressBar');
  if (bar) bar.style.width = '0%';
  const txt = document.getElementById('ocrStatusText');
  if (txt) txt.textContent = 'Waiting for screenshot input...';
}

function runSimulatedPipeline(payload, callback) {
  const bar = document.getElementById('ocrProgressBar');
  const txt = document.getElementById('ocrStatusText');

  resetPipelineStages();
  setPipelineStage(1, 'Uploading...', false);
  if (bar) bar.style.width = '25%';
  if (txt) txt.textContent = 'Encrypting & staging raw screenshot into Amazon S3 vault...';

  setTimeout(() => {
    setPipelineStage(1, 'Encrypted', true);
    setPipelineStage(2, 'Sanitizing...', false);
    if (bar) bar.style.width = '55%';
    if (txt) txt.textContent = 'AWS Lambda removing user names, phone numbers & device serials...';

    setTimeout(() => {
      setPipelineStage(2, 'PII Stripped', true);
      setPipelineStage(3, 'Parsing OCR...', false);
      if (bar) bar.style.width = '85%';
      if (txt) txt.textContent = 'Tesseract.js extracting sleep stages, step counts and timestamp metrics...';

      setTimeout(() => {
        setPipelineStage(3, 'Parsed JSON', true);
        if (bar) bar.style.width = '100%';
        if (txt) txt.textContent = 'Pipeline finished. Metrics delivered to Bedrock Reasoning Engine.';
        state.storageKb += Math.floor(Math.random() * 40 + 60);
        updateStorageUI();
        if (callback) callback(payload);
      }, 700);
    }, 700);
  }, 600);
}

function processImageOCR(file) {
  const bar = document.getElementById('ocrProgressBar');
  const txt = document.getElementById('ocrStatusText');

  resetPipelineStages();
  setPipelineStage(1, 'Vault Staged', true);
  setPipelineStage(2, 'PII Sanitized', true);
  setPipelineStage(3, 'Running OCR', false);
  if (bar) bar.style.width = '40%';
  if (txt) txt.textContent = `Scanning ${file.name} with client-side Tesseract.js...`;

  if (window.Tesseract && window.Tesseract.recognize) {
    window.Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text' && m.progress) {
          const pct = Math.round(40 + m.progress * 60);
          if (bar) bar.style.width = `${pct}%`;
          if (txt) txt.textContent = `Tesseract.js recognizing text: ${Math.round(m.progress * 100)}%`;
        }
      }
    }).then(result => {
      const recognizedText = result.data.text || '';
      finishFileOCR(file.name, recognizedText);
    }).catch(() => {
      fallbackExtraction(file.name);
    });
  } else {
    setTimeout(() => fallbackExtraction(file.name), 1200);
  }
}

function fallbackExtraction(fileName) {
  const extracted = {
    sleepHours: +(5 + Math.random() * 3).toFixed(1),
    steps: Math.floor(3500 + Math.random() * 5000),
    lateScreenHours: +(1 + Math.random() * 2).toFixed(1)
  };
  finishFileOCR(fileName, '', extracted);
}

function finishFileOCR(fileName, rawText, fallbackData) {
  const bar = document.getElementById('ocrProgressBar');
  const txt = document.getElementById('ocrStatusText');
  setPipelineStage(3, 'OCR Complete', true);
  if (bar) bar.style.width = '100%';
  if (txt) txt.textContent = `Completed extraction for ${fileName}. PII redacted.`;

  let extractedSleep = fallbackData ? fallbackData.sleepHours : 6.1;
  let extractedSteps = fallbackData ? fallbackData.steps : 5400;
  let extractedScreen = fallbackData ? fallbackData.lateScreenHours : 1.8;

  const hourMatches = rawText.match(/(\d+(\.\d+)?)\s*(h|hr|hours)/i);
  if (hourMatches && hourMatches[1]) {
    extractedSleep = parseFloat(hourMatches[1]);
  }
  const stepMatches = rawText.match(/(\d{3,6})\s*(steps|step)/i);
  if (stepMatches && stepMatches[1]) {
    extractedSteps = parseInt(stepMatches[1], 10);
  }

  state.sleepHours = extractedSleep;
  state.steps = extractedSteps;
  state.lateScreenHours = extractedScreen;
  state.storageKb += Math.floor(Math.random() * 50 + 80);
  updateStorageUI();
  calculateReadiness();
  addTimelineEvent(
    `Screenshot Ingested: ${fileName}`,
    `Extracted ${state.sleepHours}h sleep, ${state.steps} steps, ${state.lateScreenHours}h late screen.`
  );
}

function setupDragAndDrop() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageOCR(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      processImageOCR(e.target.files[0]);
    }
  });
}

function setupDemoTriggers() {
  const sleepBtn = document.getElementById('sampleSleepBtn');
  const screenBtn = document.getElementById('sampleScreenBtn');
  const habitBtn = document.getElementById('sampleHabitBtn');

  if (sleepBtn) {
    sleepBtn.addEventListener('click', () => {
      runSimulatedPipeline({}, () => {
        state.sleepHours = 5.4;
        state.steps = 4120;
        state.lateScreenHours = 2.4;
        calculateReadiness();
        addTimelineEvent(
          'Smartwatch Sleep Sample Processed',
          'NoiseFit health sync: 5h 24m sleep logged, resting HR 48 bpm, deep sleep deficit.'
        );
      });
    });
  }

  if (screenBtn) {
    screenBtn.addEventListener('click', () => {
      runSimulatedPipeline({}, () => {
        state.lateScreenHours = 3.2;
        calculateReadiness();
        addTimelineEvent(
          'Digital Wellbeing Sample Processed',
          'Screen-time parsed: 7h 10m total device use, 3h 12m after 10:30 PM threshold.'
        );
      });
    });
  }

  if (habitBtn) {
    habitBtn.addEventListener('click', () => {
      runSimulatedPipeline({}, () => {
        state.steps = 6200;
        state.lateScreenHours = 2.8;
        state.sleepHours = 4.9;
        calculateReadiness();
        addTimelineEvent(
          'Late-Night Activity Habit Processed',
          '12:45 AM app event detected; circadian disruption index elevated.'
        );
      });
    });
  }
}

function setupVoice() {
  const micBtn = document.getElementById('micBtn');
  const micLabel = document.getElementById('micLabel');
  const recIndicator = document.getElementById('recIndicator');
  const transcriptBox = document.getElementById('transcriptBox');
  const demoChips = document.querySelectorAll('.demo-chip');

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    state.recognition = new SpeechRec();
    state.recognition.continuous = false;
    state.recognition.interimResults = true;

    state.recognition.onstart = () => {
      state.isRecording = true;
      if (micBtn) micBtn.classList.add('recording');
      if (micLabel) micLabel.textContent = 'Listening...';
      if (recIndicator) recIndicator.textContent = 'Recording live...';
    };

    state.recognition.onresult = event => {
      let speechResult = '';
      for (let i = 0; i < event.results.length; i++) {
        speechResult += event.results[i][0].transcript;
      }
      if (transcriptBox) transcriptBox.textContent = `"${speechResult}"`;
    };

    state.recognition.onerror = () => {
      stopRecordingUI();
    };

    state.recognition.onend = () => {
      stopRecordingUI();
      const text = transcriptBox ? transcriptBox.textContent.replace(/"/g, '') : '';
      if (text && !text.includes('Speak a quick note')) {
        handleVoiceNoteLogged(text);
      }
    };
  }

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (!state.recognition) {
        if (transcriptBox) {
          transcriptBox.textContent = 'Speech recognition not supported in this browser. Use demo chips below.';
        }
        return;
      }

      if (state.isRecording) {
        state.recognition.stop();
        stopRecordingUI();
      } else {
        try {
          state.recognition.start();
        } catch {
          stopRecordingUI();
        }
      }
    });
  }

  demoChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const speech = chip.getAttribute('data-speech');
      if (transcriptBox) transcriptBox.textContent = `"${speech}"`;
      handleVoiceNoteLogged(speech);
    });
  });
}

function stopRecordingUI() {
  state.isRecording = false;
  const micBtn = document.getElementById('micBtn');
  const micLabel = document.getElementById('micLabel');
  const recIndicator = document.getElementById('recIndicator');
  if (micBtn) micBtn.classList.remove('recording');
  if (micLabel) micLabel.textContent = 'Tap to Speak';
  if (recIndicator) recIndicator.textContent = '';
}

function handleVoiceNoteLogged(text) {
  state.storageKb += 12;
  updateStorageUI();

  if (text.toLowerCase().includes('exhausted') || text.toLowerCase().includes('espresso')) {
    state.lateScreenHours = Math.min(4, +(state.lateScreenHours + 0.5).toFixed(1));
    state.readinessScore = Math.max(30, state.readinessScore - 8);
  } else if (text.toLowerCase().includes('walk') || text.toLowerCase().includes('refreshed')) {
    state.steps += 1800;
    state.readinessScore = Math.min(95, state.readinessScore + 6);
  }
  calculateReadiness();
  addTimelineEvent('5s Voice Note Transcribed', `"${text}" (PII redacted via Lambda)`);
}

function setupBriefingAudio() {
  const playBtn = document.getElementById('playBriefingBtn');
  const briefingScriptEl = document.getElementById('briefingScript');
  if (!playBtn) return;

  playBtn.addEventListener('click', () => {
    if (state.isPlayingBriefing) {
      stopBriefingAudio();
    } else {
      startBriefingAudio(briefingScriptEl ? briefingScriptEl.textContent : '');
    }
  });
}

function startBriefingAudio(text) {
  state.isPlayingBriefing = true;
  const playBtn = document.getElementById('playBriefingBtn');
  if (playBtn) playBtn.textContent = '⏹ Stop Audio';

  startWaveformAnimation();

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/"/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => stopBriefingAudio();
    utterance.onerror = () => stopBriefingAudio();
    window.speechSynthesis.speak(utterance);
  } else {
    setTimeout(() => stopBriefingAudio(), 6000);
  }
}

function stopBriefingAudio() {
  state.isPlayingBriefing = false;
  const playBtn = document.getElementById('playBriefingBtn');
  if (playBtn) playBtn.innerHTML = '&#9654; Play Briefing';
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  stopWaveformAnimation();
  drawRestingWaveform();
}

function startWaveformAnimation() {
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let step = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bars = 48;
    const barWidth = canvas.width / bars;

    for (let i = 0; i < bars; i++) {
      const heightMultiplier = Math.sin(step + i * 0.3) * 0.5 + 0.5;
      const barHeight = Math.max(4, heightMultiplier * (canvas.height * 0.85));
      const x = i * barWidth;
      const y = (canvas.height - barHeight) / 2;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(1, '#6366f1');

      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    }
    step += 0.15;
    state.waveformAnimId = requestAnimationFrame(render);
  }

  cancelAnimationFrame(state.waveformAnimId);
  render();
}

function stopWaveformAnimation() {
  if (state.waveformAnimId) {
    cancelAnimationFrame(state.waveformAnimId);
    state.waveformAnimId = null;
  }
}

function drawRestingWaveform() {
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bars = 48;
  const barWidth = canvas.width / bars;
  ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';

  for (let i = 0; i < bars; i++) {
    const x = i * barWidth;
    const barHeight = 4;
    const y = (canvas.height - barHeight) / 2;
    ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
  }
}

function setupDataWipe() {
  const wipeBtn = document.getElementById('wipeDataBtn');
  if (!wipeBtn) return;

  wipeBtn.addEventListener('click', () => {
    state.storageKb = 0;
    state.sleepHours = 0;
    state.steps = 0;
    state.lateScreenHours = 0;
    state.readinessScore = 0;
    state.timeline = [];
    state.sleepHistory = [0, 0, 0, 0, 0, 0, 0];
    state.screenHistory = [0, 0, 0, 0, 0, 0, 0];

    updateStorageUI();
    resetPipelineStages();

    const scoreVal = document.getElementById('readinessScoreVal');
    const statusEl = document.getElementById('readinessStatus');
    const subEl = document.getElementById('readinessSub');
    const sleepEl = document.getElementById('sleepMetric');
    const stepsEl = document.getElementById('stepsMetric');
    const screenEl = document.getElementById('screenMetric');
    const correlationEl = document.getElementById('correlationText');
    const alertEl = document.getElementById('alertText');
    const briefingScriptEl = document.getElementById('briefingScript');
    const transcriptBox = document.getElementById('transcriptBox');

    if (scoreVal) scoreVal.textContent = '0';
    if (statusEl) {
      statusEl.textContent = 'Data Wiped';
      statusEl.style.color = '#94a3b8';
    }
    if (subEl) subEl.textContent = 'All local and cloud storage purged. Zero stored intelligence.';
    if (sleepEl) sleepEl.textContent = '0.0 hrs';
    if (stepsEl) stepsEl.textContent = '0';
    if (screenEl) screenEl.textContent = '0.0 hrs';
    if (correlationEl) correlationEl.textContent = 'All Amazon Bedrock reasoning links and correlation vectors permanently removed.';
    if (alertEl) alertEl.textContent = 'No alerts scheduled. Storage reset to 0 KB.';
    if (briefingScriptEl) briefingScriptEl.textContent = '"Storage empty. No briefings queued."';
    if (transcriptBox) transcriptBox.textContent = 'Speak a quick note or tap a chip below.';

    if (state.chartInstance) {
      state.chartInstance.data.datasets[0].data = state.sleepHistory;
      state.chartInstance.data.datasets[1].data = state.screenHistory;
      state.chartInstance.update();
    }

    renderTimeline();
    stopBriefingAudio();

    const scoreCircle = document.getElementById('scoreCircle');
    if (scoreCircle) {
      scoreCircle.style.borderColor = '#64748b';
      scoreCircle.style.boxShadow = 'none';
    }

    addTimelineEvent('1-Click Privacy Purge Executed', 'Vault bucket, OCR tokens, and DynamoDB records purged. Storage: 0 KB.');
  });
}
