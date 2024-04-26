<template>
  <div class="p2p-chat" :style="`--width: ${width}; --height: ${height}`">
    <v-progress-circular
      v-if="!roomId"
      color="rgb(var(--v-theme-primary))"
      indeterminate
      size="50"
      class="mx-auto"
    ></v-progress-circular>

    <template v-else>
      <section ref="chat">
        <v-card
          v-if="showInfoCard"
          class="p2p-chat--info-card px-4 py-2 anim-movedown"
        >
          <v-btn class="btn-icon" @click="showInfoCard = false">
            <v-icon size="16">mdi-close</v-icon>
          </v-btn>

          <p class="mb-0 ellipsis-box" :style="`--lines: ${showMoreInfoCard ? 0 : 2}`">{{ infoMessage }}</p>
          <a @click="showMoreInfoCard = !showMoreInfoCard">SEE {{ showMoreInfoCard ? 'LESS' : 'MORE' }} <v-icon size="16">mdi-chevron-right</v-icon></a>
        </v-card>

        <div
          v-for="(msg, i) in messages" v-show="msg.text || msg.name || msg.src" :key="i"
          :class="['message', getMessageType(msg.authorId)]"
        >
          <div class="message__content">
            <!-- avatar -->
            <!-- <template v-if="msg.authorId !== uid && isLastMessageGroup(msg.authorId, i) && getRoomUser(msg.authorId).avatar">
              <v-img-load
                v-if="msg.authorId === MessageSpecialId.operator"
                :src="require('@/assets/sources/logos/logo.svg')"
                alt="operator's avatar"
                sizes="40px" cover
                bg-color="#fff"
                border="1px solid var(--primary)"
                rounded="50%"
                padding="5px"
                class="flex-grow-0"
              />

              <v-img-load
                v-else
                :src="getRoomUser(msg.authorId).avatar || require('@/assets/sources/avatars/avatar-male.svg')"
                alt="profile avatar"
                sizes="40px"
                rounded="50%" cover
                class="flex-grow-0"
              />
            </template> -->

            <div :class="['message__content-card', msg.type, isLastMessageGroup(msg.authorId, i) ? 'first-bubble' : '']">
              <!-- text message -->
              <p v-if="msg.type === MessageType.text || msg.authorId === MessageSpecialId.system" v-html="msg.text" />

              <!-- image message -->
              <v-badge
                v-else-if="msg.type === MessageType.image"
                :color="'transparent'"
                :inline="false"
              >
                <template #badge>
                  <span
                    v-if="false"
                    class="bg-primary pa-1 pointer"
                    style="border-radius: 8px;"
                    @click="resendFile(msg, msg.file)"
                  >Reintentar</span>
                </template>

                <div
                  class="message__content-card__image"
                  style="position: relative"
                >
                  <input type="checkbox" class="message__content-card__image-toggle">
                  <div :style="`--bg-image: url(${msg.photoURL})`" />

                  <v-progress-circular
                    v-show="false"
                    indeterminate
                    color="rgb(var(--v-theme-secondary))"
                    style="position: absolute"
                  ></v-progress-circular>

                  <img :src="msg.photoURL" :alt="`image sended by ${getRoomUser(msg.wallet)}`">
                </div>
              </v-badge>

              <!-- file message -->
              <a
                v-else-if="msg.type === MessageType.file"
                class="message__content-card__file"
                :class="{loading: msg.status === MessageStatus.sending}"
                :href="msg.photoURL"
                download
              >
                <v-progress-circular
                  v-show="msg.status === MessageStatus.sending"
                  indeterminate
                  size="20"
                  width="2"
                ></v-progress-circular>

                <v-icon color="var(--color-sent)">mdi-file</v-icon>
                <span>{{msg.name}}</span>
              </a>
            </div>
          </div>

          <span
            v-if="msg.authorId !== MessageSpecialId.system"
            class="message-date"
          ><p style="font-weight: bold; margin-bottom: -1px;">{{ msg.wallet }}</p> {{ getHours(msg.createdAt) }}</span>
        </div>
      </section>


      <form @submit.prevent="sendMessage">
        <div
          v-if="photo"
          class="photo-preview"
          :style="{ 'background-image': `url(${messagePhoto})` }"
          @click="photo = null"
        ></div>

        <input
          v-model="message"
          type="text"
          placeholder="MENSAJE"
        />
        
        <button
          :disabled="isLoadingFile"
          type="button"
          class="button"
          style="border-radius: 0"
          :class="{ 'is-loading': isLoadingFile }"
          @click="$refs.file.click()"
        >
          <v-icon>mdi-paperclip</v-icon>
          <input ref="file" type="file" class="inputfile d-none" accept=".jpg,.jpeg,.png" @change="event => onFileChange(event.target.files[0])" />
        </button>

        <button :disabled="!message" style="padding-right: 5px" @click="sendMessage">
          <v-icon color="var(--primary)">mdi-send</v-icon>
        </button>
      </form>
    </template>
  </div>
</template>

<script>
import firebase from "firebase/compat/app";
import moment from "moment"
import { Timestamp } from 'firebase/firestore'
// import { timeOf } from '@/plugins/functions'
import { db } from "@/plugins/firebase";
import { MessageModel, MessageSpecialId, MessageStatus, MessageType } from '~/models/message_model'
import { RoomUserInfo } from '~/models/p2p_user_model'


export default {
  props: {
    roomId: {
      type: String,
      default: "1"
    },
    width: {
      type: String,
      default: "max(400px, 28vw)",
    },
    height: {
      type: String,
      default: "450px",
    },
    textActionButton: {
      type: String,
      default: undefined
    },
  },
  data() {
    return {
      photo: null,
      orderId: localStorage.getItem("orderId"),
      operation: localStorage.getItem("operation"),
      MessageSpecialId,
      MessageType,
      uid: "2",
      userIsTyping: false,
      otherUsersIsTyping: [],
      message: undefined,
      roomUsers: [],
      messages: [],
      isLoading: true,
      isLoadingFile: false,
      showInfoCard: false,
      showMoreInfoCard: false,
      infoMessage: "We recommend that you try to choose verified merchants, not reasdasd laksdñl aksñl dkasñl kdñlaskñs asd as das das a asd asd as d asdasdasda",
      terms: localStorage.getItem("terms"),
      chat: null,
      file: null,
      unreadMessagesCount: 0,
      polling: null,
    }
  },
  computed: {
    messagePhoto() {
      return URL.createObjectURL(this.photo);
    },
  },
  watch: {
    roomId(_) {
      this.getMessages()
    }
  },
  // created() {
  //   this.getUnreadMessagesCount();
  // },
  beforeDestroy() {
    clearInterval(this.polling);
  },
  mounted() {
    this.getMessages()
    this.terms = localStorage.getItem("terms");
    // this.pollData();
    // this.getMessages()
  },
  methods: {
    onFileChange(event) {
      // console.log(event)
      this.photo = event;
      // this.$refs.input.focus();

      // event?.preventDefault();
      if (this.photo) {
        const timestamp = Date.now();
        const storageRef = firebase
          .storage()
          .ref(`${timestamp}${this.photo.name}`);
        const uploadTask = storageRef.put(this.photo);

        uploadTask.on('state_changed', 
          (snapshot) => {
            // You can use this function to monitor the upload progress
          }, 
          (error) => {
            // Handle unsuccessful uploads
            console.error(error);
          }, 
          () => {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then((url) => {
              const messageInfo = {
                authorId: null,
                wallet: localStorage.getItem("address"),
                photoURL: url,
                text: this.message || " ",
                readed: true,
                type: MessageType.image,
                updatedAt: Date.now(),
                createdAt: Date.now(),
              }

              db
                .collection(process.env.VUE_APP_CHAT_FIREBASE)
                .doc(`${this.operation}${this.orderId}`)
                .collection("MESSAGES")
                .add(messageInfo);

              this.getMessages();

              this.message = "";
              this.photo = null;
            });
          }
        );
      }
    },
    pollData() {
			this.polling = setInterval(() => {
        this.getUnreadMessagesCount();
			}, 5000);
		},  
    async markMessageAsRead(messageId) {
      try {
        const docRef = db
          .collection(process.env.VUE_APP_CHAT_FIREBASE)
          .doc(`${this.operation}${this.orderId}`)
          .collection("MESSAGES")
          .doc(messageId);

        await docRef.update({
          read: true
        });

        // console.log("Document successfully updated!");
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    },
    async getUnreadMessagesCount() {
      try {
        const messagesSnapshot = await db
          .collection(process.env.VUE_APP_CHAT_FIREBASE)
          .doc(`${this.operation}${this.orderId}`)
          .collection("MESSAGES")
          .where("readed", "==", false)
          .get();
        // console.log(messagesSnapshot)
        this.unreadMessagesCount = messagesSnapshot.size;
        console.log("unreadMessagesCount", this.unreadMessagesCount)
      } catch (error) {
        console.error("Failed to get unread messages count:", error);
      }
    },
    getMessages() {
      // console.log("VUE_APP_CHAT_FIREBASE",process.env.VUE_APP_CHAT_FIREBASE)
      db
        .collection(process.env.VUE_APP_CHAT_FIREBASE)
        .doc(`${this.operation}${this.orderId}`)
        .collection("MESSAGES")
        .orderBy("createdAt")
        .onSnapshot((snapshot) => {
          // const postData = [];

          // console.log("snapshot", snapshot)

          const msgs = [
            {
              authorId: "system",
              createdAt: Date.now(),
              text: this.terms,
              type: MessageType.text,
              updatedAt: Date.now()
            }
          ]

          snapshot.forEach((doc) => {
            const item = { ...doc.data(), id: doc.id};
            if (item.wallet === localStorage.getItem("address")) {
              item.authorId = "2"
            } else {
              item.authorId = "1"

            }
            // console.log("message", item)
            
            msgs.push(item)

            
            // const item = { ...doc.data(), id: doc.id, active: false };
            // postData.push(item);
          });

          this.messages = msgs;
          // console.log(this.messages , "MESSAGES")
          // this.chat = postData;
        });
    },
    async sendMessage(event) {
      event.preventDefault();
      if (this.photo) {
        const timestamp = Date.now();
        const storageRef = firebase
          .storage()
          .ref(`${timestamp}${this.photo.name}`)
          .put(this.photo);
        await storageRef.on(`state_changed`, () => {
          storageRef.snapshot.ref.getDownloadURL().then(url => {
            // console.log("url",url)
            const messageInfo = {
              authorId: null,
              wallet: localStorage.getItem("address"),
              photoURL: url,
              text: this.message,
              readed: true,
              type: MessageType.image,
              updatedAt: Date.now(),
              createdAt: Date.now(),
            }

            // console.log(messageInfo, "HOLAAAA")

            db
              .collection(process.env.VUE_APP_CHAT_FIREBASE)
              .doc(`${this.operation}${this.orderId}`)
              .collection("MESSAGES")
              .add(messageInfo);
            // db
            //   .collection(process.env.VUE_APP_CHAT_FIREBASE || "TESTNET")
            //   .doc(this.orderId)
            //   .set({ artist: this.activeChat.artist || "", ago: Date.now() });

            this.getMessages();

            this.message = "";
            this.photo = null;
          });
        });
      }
     else if (this.message) {
        const messageInfo = {
          authorId: null,
          wallet: localStorage.getItem("address"),
          text: this.message,
          readed: true,
          type: MessageType.text,
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }

        // console.log(messageInfo)

        db
          .collection(process.env.VUE_APP_CHAT_FIREBASE)
          .doc(`${this.operation}${this.orderId}`)
          .collection("MESSAGES")
          .add(messageInfo);
        // db
        //   .collection(process.env.VUE_APP_CHAT_FIREBASE || "TESTNET")
        //   .doc(this.orderId)
        //   .set({ artist: this.activeChat.artist || "", ago: Date.now() });

        this.getMessages();

        this.message = "";
      }
    },
    getData() {
      // get room users
      const users = [
        new RoomUserInfo({
          avatar: "https://th.bing.com/th/id/OIP.4XB8NF1awQyApnQDDmBmQwHaEo?w=251&h=180&c=7&r=0&o=5&pid=1.7",
          email: "asdasd",
          nickname: "pedro",
          uid: "1",
          isMerchant: false,
          isOwner: true,
          isSeen: false,
          isTyping: false,
        }).toJson(),
        new RoomUserInfo({
          avatar: "https://th.bing.com/th/id/OIP.4XB8NF1awQyApnQDDmBmQwHaEo?w=251&h=180&c=7&r=0&o=5&pid=1.7",
          email: "asdasd",
          nickname: "andres",
          uid: "2",
          isMerchant: false,
          isOwner: false,
          isSeen: false,
          isTyping: false,
        }).toJson(),
      ]
      
      this.roomUsers = users
        this.otherUsersIsTyping = users.filter(e => e.uid !== this.uid).map(e => ({
          uid: e.uid,
          nickname: e.nickname,
          avatar: e.avatar,
          isTyping: e.isTyping
        }))

      // get messages
      const msgs = [
        new MessageModel({
          authorId: "system",
          createdAt: Timestamp.now(),
          status: MessageStatus.sent,
          text: this.terms,
          type: MessageType.text,
          updatedAt: Timestamp.now()
        }).toJson(),
        new MessageModel({
          authorId: "2",
          createdAt: Timestamp.now(),
          status: MessageStatus.sent,
          text: "Hello",
          type: MessageType.text,
          updatedAt: Timestamp.now()
        }).toJson(),
        new MessageModel({
          authorId: "1",
          createdAt: Timestamp.now(),
          status: MessageStatus.sent,
          text: "Good morning",
          type: MessageType.text,
          updatedAt: Timestamp.now()
        }).toJson(),
        new MessageModel({
          authorId: "1",
          createdAt: Timestamp.now(),
          status: MessageStatus.sent,
          text: "Bank details?",
          type: MessageType.text,
          updatedAt: Timestamp.now()
        }).toJson(),
        new MessageModel({
          authorId: "2",
          createdAt: Timestamp.now(),
          status: MessageStatus.sent,
          text: "Zelle<br> working@myemail.com<br> Note: *Trade",
          type: MessageType.text,
          updatedAt: Timestamp.now()
        }).toJson(),
      ]

      const updatedMessages = msgs.map((messageB) => {
        const messageA = this.messages.find((message) =>
          message.status === MessageStatus.sending
          && message.createdAt === messageB.createdAt
        );
        if (messageA) return messageA;

        return messageB;
      });

      this.messages = updatedMessages;
      // messages = msgs

      if (this.isLoading) setTimeout(() => {
        // this.chat.scrollTop = this.chat.scrollHeight
        this.isLoading = false
      }, 100);
    },
    
    getRoomUser(muid) {
      const user = this.roomUsers.find(e => e.uid === muid)
      return user ?? {}
    },
    
    getMessageType(muid) {
      return muid === MessageSpecialId.operator
        ? MessageSpecialId.operator
          : muid === MessageSpecialId.system
            ? MessageSpecialId.system
              : muid === this.uid
                ? 'userMessage'
                : 'otherUserMessage'
    },

    getHours(time) {
      return moment(time).format("HH:mm");
      // return timeOf(time).format("HH:mm")
    },

    isLastMessageGroup(authorId, currentIndex) {
      if (currentIndex === this.messages.length - 1) {
        // Show avatar in last message
        return true;
      } else {
        const nextAuthorId = this.messages[currentIndex + 1]?.authorId;
        // Show the avatar only if the author is different from the author of the following message
        return authorId !== nextAuthorId;
      }
    },
        
    // sendMessage() {
    //   const msg = this.message
    //   this.message = undefined

    //   this.messages.push(new MessageModel({
    //     authorId: "2",
    //     createdAt: Timestamp.now(),
    //     status: MessageStatus.sent,
    //     text: msg,
    //     type: MessageType.text,
    //     updatedAt: Timestamp.now()
    //   }).toJson())
    //   // this.chat.scrollTop = this.chat.scrollHeight
    // },

    reloadMessages() {
      const saved = Array.of(this.message)
      this.message = undefined
      setTimeout(() => { this.message = saved }, 200);
    }
  }
}
</script>

<style lang="scss">
  .p2p-chat {
    $margin-vertical: 13px;
    $scrollbar-width: 8px;
    --color-background: #f9fafa;
    --color-cursor: #e15517;
    --color-primary: #ED6D05;
    --color-sent: #4caf50;
    --color-system: #e0e0e0;


    width: 100%;
    height: var(--height, 450px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: sticky;
    overflow: hidden;
    top: calc(50% - var(--height) / 2);
    
    &--info-card {
      border-radius: 10px !important;
      background: #BFFBFA !important;
      margin-bottom: 12px;

      .v-btn {
        float: right;
        --size: 27px;
        margin-left: 25px;
      }

      p {
        --ff: var(--font4) !important;
        --fs: 10px !important;
        --fw: 500 !important;
        --lh: 11.69px !important;
      }

      a {
        font-family: var(--font1) !important;
        font-size: 10px !important;
        font-weight: 700 !important;
        line-height: 12.1px !important;
        letter-spacing: -0.01em !important;
        float: right;
      }
    }


    section {
      padding-right: 5px;
      margin-bottom: 10px;
      overflow-y: scroll;
      overflow-x: hidden;
      scrollbar-gutter: stable;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      // scroll-behavior: smooth;

      &::-webkit-scrollbar { width: $scrollbar-width }


      .message {
        display: flex;
        flex-direction: column !important;
        gap: 5px;
        margin-bottom: 12px;

        &__content {
          display: flex;
          gap: 10px;
        }

        &:where(.otherUserMessage, .operator) {
          .message-date { margin-left: 50px }
          .message__content-card {
            &:not(.image) { background: #979CA6 !important }
            margin-left: 50px;
            margin-right: auto;
            color: #fff !important;

            * { color: #fff !important }

            &.first-bubble {
              margin-left: 0px;
              border-bottom-left-radius: 0;
            }
          }
        }


        &.userMessage {
          align-items: flex-end;
          flex-direction: row-reverse;

          .message__content-card {
            &:not(.image) {
              background: var(--color-primary) !important;
              * { color: #fff !important }
            }
            margin-left: auto;
            color: #000 !important;

            * { color: #000 !important }

            &.first-bubble {
              border-bottom-right-radius: 0;
            }
          }
        }


        &.system  {
          .message__content-card {
            min-width: 100% !important;
            border-radius: 10px !important;
            background-color: var(--card-2);
            border: 1px solid #000000;
            color: #333;
            font-family: var(--font1) !important;
            font-size: 9px !important;
            font-weight: 500 !important;
            line-height: 8.47px !important;
            letter-spacing: -0.01em !important;
            margin-bottom: 40px;

            p {
              color: #333;
              font-family: var(--font1) !important;
              font-size: 9px !important;
              font-weight: 500 !important;
              line-height: 8.47px !important;
              letter-spacing: -0.01em !important;
              margin-right: auto;
            }
          }
        }


        &__content-card {
          display: flex;
          flex-direction: column;
          max-width: max-content;
          font-size: 16px;
          color: rgb(255, 255, 253);
          border-radius: 15px;
          &:not(.image) {padding: 15px;}

          &::after {
            content: var(--date);
            font-size: 12px;
            align-self: flex-end;
          }

          &.image::after { color: #fff }

          p {
            margin-bottom: 0;;
            color: white;
            font-family: var(--font1) !important;
            --fs: 11px;
            --fw: 300 !important;
            --lh: 12.1px;
            --ls: -0.01em;
            align-self: center;
          }

          
          &__image {
            display: grid;
            place-items: center;

            img {
            --w: 250px;
            --h: 150px;
            max-width: var(--w);
            max-height: var(--h);
            max-width: var(--w);
            max-height: var(--h);
            object-fit: cover;
            border: 1px solid;
            border-radius: 16px;
          }

            &-toggle {
              width: 100%;
              height: 100%;
              position: absolute;
              inset: 0;
              z-index: 2;
              opacity: 0;
              cursor: -webkit-zoom-in;
              cursor: zoom-in;
            }

            &-toggle:checked {
              position: fixed;
              z-index: 100;
              cursor: -webkit-zoom-out;
              cursor: zoom-out;

              & + div {
                position: fixed;
                inset: 0;
                background-color: hsl(0, 0%, 0%, .75);
                background-image: var(--bg-image);
                background-position: center;
                background-size: contain;
                z-index: 99;
              }
            }
          }

          &__file {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 5px;
            cursor: pointer;

            &.loading { pointer-events: none }
          }
        }
      }
    }


    form {
      min-height: 45px;
      display: flex;
      font-size: 1.80px;
      border-radius: 30px;
      border: 2px solid var(--primary);
      overflow: hidden;
      margin-bottom: $margin-vertical;
      
      button, input {
        color: #fff;
        border: none;

        * { color: #fff }
      }

      input {
        width: 100%;
        background: var(--card-2);
        outline: none;
        padding: 0;
        padding-left: 16px;

        font-family: var(--font4) !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        line-height: 11.69px !important;
        letter-spacing: 0.19em !important;
        --c: #000 !important;
        color: #000 !important;

        &::placeholder {
          font-family: var(--font2) !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          line-height: 11.69px !important;
          letter-spacing: 0.39em !important;
        }

        &:disabled { cursor: not-allowed }
      }

      button {
        width: 50px;
        height: 100%;
        background: var(--card-2);
        display: inline-block;
        cursor: pointer;
        font-size: 16px;

        &:first-child {
          border-bottom-right-radius: 0;
          border-top-right-radius: 0;
        }
        &:last-child {
          border-bottom-left-radius: 0;
          border-top-left-radius: 0;
        }

        &:disabled {
          cursor: not-allowed;

          * { opacity: 0.5 }
        }
      }
    }

    // html
    // <span class="loader"></span>

    // css
    // typing loader
    // .loader{
    //   width: 100px;
    //   height: 75px;
    //   margin: 0 auto;
    //   background: #fff;
    //   position: relative;
    //   border-radius: 100%;
    // }
    // .loader:before {
    //   content: '';
    //   position: absolute;
    //   box-sizing: border-box;
    //   border: 15px solid transparent;
    //   border-top: 25px solid #fff;
    //   transform: rotate(45deg);
    //   top: 50px;
    //   left: -15px;
    // }

    // .loader:after {
    //   content: '';
    //   width: 12px;
    //   height: 12px;
    //   position: absolute;
    //   left: 50%;
    //   top: 50%;
    //   transform: translate(-50% , -50%);
    //   border-radius: 50%;
    //   background-color: #FF3D00;
    //   box-shadow: 20px 0 #FF3D00, -20px 0 #FF3D00;
    //   animation: flash 0.5s ease-out infinite alternate;
    // }

    // @keyframes flash {
    //   0% {
    //     background-color: rgba(255, 60, 0, 0.25);
    //     box-shadow: 20px 0 rgba(255, 60, 0, 0.25), -20px 0 #FF3D00;
    //   }
    //   50% {
    //     background-color: #FF3D00;
    //     box-shadow: 20px 0 rgba(255, 60, 0, 0.25), -20px 0 rgba(255, 60, 0, 0.25);
    //   }
    //   100% {
    //     background-color: rgba(255, 60, 0, 0.25);
    //     box-shadow: 20px 0 #FF3D00, -20px 0 rgba(255, 60, 0, 0.25);
    //   }
    // }
  }
</style>
