const app = {
    name: "MediaDevices",
    watch: {
        deviceIndex(newVal, oldVal) {
            navigator.mediaDevices.getUserMedia({
                    video: false,
                    audio: this.audioInputDevices[newVal]
                }).then((stream) => {
                    this.$refs.audio.srcObject = stream;
                })
                .catch((err) => {
                    console.log(err)
                })

        }
    },
    data() {
        return {
            // 设备信息
            audioInputDevices: [],
            audioDeviceIndex: 0,
            videoInputDevices: [],
            videoDeviceIndex: 0,

            // 媒体录制信息
            audioWebmData: null,
            audioRecording: false,
            audioPaused: false,

            videoWebmData: null,
            videoRecording: false,
            videoPaused: false,
        }
    },
    computed: {},
    created() {
        this.getDevices();

        // 请求使用麦克风，媒体输入会产生MediaStream ,  注意如果参数constraints没包含video或audio 无效
        navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            }).then((stream) => {
                /* 使用这个stream stream */

                this._audioRecorder = new MediaRecorder(stream, {
                    mimeType: "video/webm;codecs=h264"
                })
                this._audioRecorder.ondataavailable = (e) => {
                    console.log("音频信息", e)
                    this.audioWebmData = e.data;
                }

                // 实时播放
                // this.$refs.audio.srcObject = stream;
            })
            .catch((err) => {
                /* 处理error 包括用户拒绝权限*/
                console.log("错误信息", err)
            });


        navigator.mediaDevices.getUserMedia({
                // 允许音频和视频
                video: true,
                audio: true
            }).then((stream) => {
                /* 使用这个stream stream */

                // 创建MediaRecorder 对象, 并设置编码格式
                this._videoRecorder = new MediaRecorder(stream, {
                    mimeType: "video/webm;codecs=h264"
                })
                this._videoRecorder.ondataavailable = (e) => {
                    console.log("视频信息", e)
                    this.videoWebmData = e.data;
                }

                // 实时播放
                // this.$refs.video.srcObject = stream;
            })
            .catch((err) => {
                /* 处理error 包括用户拒绝权限*/
                console.log("错误信息", err)
            });

    },

    mounted() {
        // 创建画布的 2d 上下文
        this._ctx = this.$refs.canvas.getContext("2d");
    },
    methods: {
        async getDevices() {
            // enumerateDevices()  获取有关系统中可用的媒体输入和输出设备的一系列信息。
            const mediaDevices = await navigator.mediaDevices.enumerateDevices();

            // 箭头函数没有{} 包裹，有包裹就是一个函数需要return
            /*        
                this.audioInputDevices = mediaDevices.filter(value =>{
                  return  value.kind === "audiouinput";
                }); 
            */
            this.audioInputDevices = mediaDevices.filter(value => value.kind === "audioinput");

            this.videoInputDevices = mediaDevices.filter(value => value.kind === "videoinput")

            console.log(this.audioInputDevices, this.videoInputDevices)

        },

        // 视频截图
        takePhoto() {
            this._ctx.drawImage(this.$refs.video, 0, 0, 500, 300)
        },

        // 媒体录制开始
        start(mediaType) {
            // 把上次的录制数据清除
            this.audioWebmData = null;
            this.videoWebmData = null;

            if (mediaType === "audio") {
                this.audioRecording = true;
                this._audioRecorder.start();
            } else {
                this.videoRecording = true;
                this._videoRecorder.start()
            }
        },

        // 媒体录制暂停
        pause(mediaType) {
            if (mediaType === "audio") {
                this.audioPaused = true;
                this._audioRecorder.pause();
            } else {
                this.videoPaused = true;
                this._videoRecorder.pause()
            }
        },

        // 媒体录制继续
        resume(mediaType) {
            if (mediaType === "audio") {
                this.audioPaused = false;
                this._audioRecorder.resume();
            } else {
                this.videoPaused = false;
                this._videoRecorder.resume()
            }
        },

        // 媒体录制结束
        stop(mediaType) {
            if (mediaType === "audio") {
                this.audioRecording = false;
                this._audioRecorder.stop();

            } else {
                this.videoRecording = false;
                this._videoRecorder.stop()

            }
        },

        // 媒体播放
        play(mediaType) {
            if (mediaType === "audio") {
                this.$refs.audio.src = URL.createObjectURL(this.audioWebmData);
            } else {
                this.$refs.video.src = URL.createObjectURL(this.videoWebmData);
            }
        },

        // 屏幕录制, 切换videoRecorder 的stream, 点击停止窗口无效的
        screenRecording() {
            navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false,
                }).then(stream => {
                    this._videoRecorder = new MediaRecorder(stream, {
                        mimeType: "video/webm;codecs=h264"
                    })
                    this._videoRecorder.ondataavailable = (e) => {
                        console.log("屏幕录制信息", e)
                        this.videoWebmData = e.data;
                    }
                })
                .catch(err => {
                    console.log("错误信息", err)
                })
        }

    },


}

Vue.createApp(app).mount("#app")