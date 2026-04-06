const {exec} = require('child_process');

exec('npm.cmd run dev', {
  cwd: 'c:\\Users\\nickxu\\WorkBuddy\\20260406100459\\capybara-game',
}, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});
