import readline from 'readline';

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', (line) => {
    const cmd = line.trim().toLowerCase();

    switch (cmd) {
      case 'uptime': {
        const secs = process.uptime();
        console.log(`Uptime: ${secs.toFixed(2)}s`);
        break;
      }
      case 'cwd':
        console.log(process.cwd());
        break;
      case 'date':
        console.log(new Date().toISOString());
        break;
      case 'exit':
        rl.close();
        return;
      case '':
        break;
      default:
        console.log('Unknown command');
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
  });
};

interactive();
