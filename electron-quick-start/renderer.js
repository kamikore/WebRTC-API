// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

/* 
    这个文件是 index.html 文件所需要的，并且会
    在该窗口的渲染器进程中执行。
    此过程中没有可用的 Node.js API，因为
    `nodeIntegration` 已关闭。 使用`preload.js`选择性地启用渲染中需要的功能
    https://www.electronjs.org/zh/docs/latest/tutorial/quick-start#%E9%80%9A%E8%BF%87%E9%A2%84%E5%8A%A0%E8%BD%BD%E8%84%9A%E6%9C%AC%E4%BB%8E%E6%B8%B2%E6%9F%93%E5%99%A8%E8%AE%BF%E9%97%AEnodejs
*/

const fs = require("fs")

// 引入 electron dialog API 注意这是主进程模块, 当前渲染进程
const {
    dialog
} = require('@electron/remote')




// 注意后缀 .js，提示时会省略后缀
// 根据node_module index.js ，入口文件为/vue.cjs.js
const Vue = require("vue/dist/vue.cjs.prod.js")

const app = {
    name: "Electron DesktopCapturer",
    data() {
        return {
            heading: "hello vue ",
            videoWebmData: null,
            isRecording: false,
            recordType: 0,
        }
    },
    methods: {
        async startRecording() {
            console.log("startRecording")
            
            navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            }).then(stream => {
                console.log("音频设备",stream)
            })
            .catch(err => {
                console.log("音频错误信息", err)
                alert(err)
            })

           navigator.mediaDevices.getUserMedia({
               video: true
            }).then(stream => {
                this.$refs.preview.srcObject = stream;
           })
           .catch(err => {
                console.log("视频错误信息", err)
                alert(err)
            })



            navigator.mediaDevices.getDisplayMedia({video: true})
            .then(stream => {
                 console.log("显示设备",stream)
             }).catch(err => {
                console.log("显示设备错误信息", err)
                alert(err)
            })
            navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            // chromeMediaSourceId: source.id,
                            minWidth: 1366,
                            maxWidth: 1366,
                            minHeight: 768,
                            maxHeight: 768
                        }
                    }
                })
                .then(screenStream => {
                    this.isRecording = true;
                    // 合成音频轨道
                    // screenStream.getVideoTracks().forEach(track => this._audioStream.addTrack(track));

                    console.log("视频轨道", screenStream.getVideoTracks())
                    // 开始预览
                    // this.$refs.preview.srcObject = screenStream;

                    this._recorder = new MediaRecorder(this._audioStream, {
                        mimeType: "video/webm;codecs=h264"
                    })

                    this._recorder.ondataavailable = e => {
                        console.log(e)
                        // electron dialog API, 保存文件的对话框
                        dialog.showSaveDialog({
                                title: "保存录制文件",
                                defaultPath: "screenData.webm"
                            }).then(async res => {
                                console.log(res.filePath);
                                console.log(await e.data.arrayBuffer())
                                // arrayBuffer() 方法返回一个 Promise 对象，包含 blob 中的数据，并在 ArrayBuffer 中以二进制数据的形式呈现。
                                fs.writeFileSync(res.filePath, Buffer.from(await e.data.arrayBuffer()))
                            })
                            .catch(err => console.log(err))
                    }

                    this._recorder.start();

                })
                .catch(err => {
                    console.log("错误信息", err)
                    alert(err)
                })

        },
        stopRecording() {
            // 停止预览播放
            this.$refs.preview.srcObject = null
            this.isRecording = false;
            this._recorder.stop();
        }
    },
    mounted() {
        if(!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia){
            alert('getUserMedia is not supported!');
          }
    },

}

Vue.createApp(app).mount("#app")