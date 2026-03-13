const parseArgs = () => {
  const args = process.argv.slice(2);
  const opts = {
    duration: 5000,
    interval: 100,
    length: 30,
    color: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === '--duration' && next != null) {
      opts.duration = Number(next);
      i++;
    } else if (arg === '--interval' && next != null) {
      opts.interval = Number(next);
      i++;
    } else if (arg === '--length' && next != null) {
      opts.length = Number(next);
      i++;
    } else if (arg === '--color' && next != null) {
      const hex = next.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        opts.color = {
          r: parseInt(hex.slice(1, 3), 16),
          g: parseInt(hex.slice(3, 5), 16),
          b: parseInt(hex.slice(5, 7), 16),
        };
      }
      i++;
    }
  }

  return opts;
};

const colorize = (rgb, text) => {
  if (!rgb) return text;
  const { r, g, b } = rgb;
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};

const progress = () => {
  const { duration, interval, length, color } = parseArgs();
  const start = Date.now();

  const tick = () => {
    const elapsed = Date.now() - start;
    const p = Math.min(1, elapsed / duration);
    const filledLen = Math.round(length * p);
    const filled = '█'.repeat(filledLen);
    const empty = ' '.repeat(length - filledLen);
    const percent = Math.round(p * 100);
    const bar = `[${colorize(color, filled)}${empty}] ${percent}%`;
    process.stdout.write(`\r${bar}`);

    if (p >= 1) {
      process.stdout.write('\nDone!\n');
      process.exit(0);
    }
  };

  tick();
  const id = setInterval(tick, interval);
};

progress();
