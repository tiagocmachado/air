const http = require("http");
const path = require("path");
const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');
const {parse} = require('querystring');
const uuid = require('uuid');
const {execSync} = require('child_process')

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(
            path.join(__dirname, 'public', 'index.html'),
            (err, content) => {
                if (err) throw err;
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(content);
            }
        );
    }

    if (req.url === '/download') {
        fs.readFile(path.join(__dirname, 'output', 'out.mp4'), function (err, content) {
            if (err) {
                res.writeHead(400, {'Content-type':'text/html'})
                res.end("No such file");
            } else {
                res.setHeader('Content-disposition', 'attachment; filename=out.mp4');
                res.end(content);
            }
        });
    }

    if (req.url === '/merge') {
        const videoSize = '640x400';
        const id = uuid.v4();
        const requestDirectory = path.join(__dirname, '/temp', id);
        fs.mkdirSync(requestDirectory, {}, err => {
            if (err) throw err;
        });

        let body = '';

        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const {video1, video2} = parse(body)
            const video1Path = path.join(requestDirectory, '1.mp4');
            const video2Path = path.join(requestDirectory, '2.mp4');

            const resize1 = ffmpeg(video1).clone()
                .size(videoSize)
                .save(video1Path)
                .on('progress', () => console.log('resizing first video'))
                .on('end', () => {
                    const resize2 = ffmpeg(video2).clone()
                        .size(videoSize)
                        .save(video2Path)
                        .on('progress', () => console.log('resizing second video'))
                        .on('end', () => {
                            const output = './output/out.mp4';
                            const merge = ffmpeg(video1Path)
                                .input(video2Path)
                                .on('end', () => {
                                    if (process.platform === 'win32') {
                                        execSync(`del /f /s ${requestDirectory}`)
                                    } else {
                                        execSync(`rm -rf ${requestDirectory}`)
                                    }

                                })
                                .on('error', err => console.log('an error happened during merge: ' + err.message))
                                .mergeToFile(output);

                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({output}));
                        })
                })
        });
    }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));