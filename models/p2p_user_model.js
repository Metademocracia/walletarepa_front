export class RoomUserInfo {
  constructor({
    nickname,
    avatar,
    email,
    uid,
    isTyping = false,
    isSeen = false,
    isMerchant = false,
    isOwner = false,
  }) {
    this.uid = uid;
    this.isTyping = isTyping;
    this.isSeen = isSeen;
    this.nickname = nickname;
    this.avatar = avatar;
    this.email = email;
    this.isMerchant = isMerchant;
    this.isOwner = isOwner;
  }

  toJson() {
    return {
      uid: this.uid,
      nickname: this.nickname,
      avatar: this.avatar,
      email: this.email,
      isTyping: this.isTyping,
      isSeen: this.isSeen,
      isMerchant: this.isMerchant,
      isOwner: this.isOwner,
    }
  }

  static fromJson(json) {
    return new RoomUserInfo({
      uid: json.uid,
      nickname: json.nickname,
      avatar: json.avatar.split("?")[0] ?? "",
      email: json.email,
      isTyping: json.isTyping,
      isSeen: json.isSeen,
      isMerchant: json.isMerchant,
      isOwner: json.isOwner,
    })
  }

  static fromOwnerId(
    ownerId,
    {
      isTyping = false,
      isSeen = false,
      isMerchant = false,
      isOwner = false,
    }) {
    return new RoomUserInfo({
      uid: ownerId.userid,
      nickname: ownerId.nickname,
      avatar: ownerId.avatar.split("?")[0] ?? "",
      email: ownerId.email,
      isTyping,
      isSeen,
      isMerchant,
      isOwner,
    })
  }
}

export class UserActivity {
  constructor({
    uid,
    isOnline = false,
  }) {
    this.uid = uid;
    this.isOnline = isOnline;
  }

  toJson() {
    return {
      uid: this.uid,
      isOnline: this.isOnline,
    }
  }

  static fromJson(json) {
    return new UserActivity({
      uid: json?.uid,
      isOnline: json?.isOnline,
    })
  }
}