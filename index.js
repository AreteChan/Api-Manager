var child_process = require('child_process');

console.log("Node Version: ", process.version);

run_script("back-end", "yarn", ["dev"])

console.log ("Continuing to do node things while the process runs at the same time...");

// This function will output the lines from the script 
// AS is runs, AND will return the full combined output
// as well as exit code when it's done (using the callback).
function run_script(name, command, args, callback) {
    console.log(`[${name}]Starting Process.`);
    var child = child_process.spawn(process.platform === 'win32' ? `${command}.cmd` : command, args, {
        cwd: name, // Setting Current Working Directory.
    });

    var scriptOutput = "";

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        console.log(`[${name}]:\n` + data);

        data=data.toString();
        scriptOutput+=data;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        console.log(`[${name}]💥err:\n` + data);

        data=data.toString();
        scriptOutput+=data;
    });

    child.on('close', function(code) {
        callback?.(scriptOutput,code);
    });
}