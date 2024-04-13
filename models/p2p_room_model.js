class P2PRoomModel {
  constructor({
      roomId,
      creationType,
      createdAt,
      updatedAt,
      autoMessage,
      assetLogo,
      fiatLogo,
      paymentMethods,
      users,
      status = 1,
    }) {
    this.roomId = roomId;
    this.creationType = creationType;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.autoMessage = autoMessage;
    this.assetLogo = assetLogo;
    this.fiatLogo = fiatLogo;
    this.paymentMethods = paymentMethods;
    this.users = users;
    this.status = status;
  }

  toJson() {
    return {
      roomId: this.roomId,
      creationType: this.creationType,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      autoMessage: this.autoMessage,
      assetLogo: this.assetLogo,
      fiatLogo: this.fiatLogo,
      paymentMethods: this.paymentMethods,
      users: this.users,
      status: this.status,
    }
  }

  copyWith({
    roomId = this.roomId,
    creationType = this.creationType,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt,
    autoMessage = this.autoMessage,
    assetLogo = this.assetLogo,
    fiatLogo = this.fiatLogo,
    paymentMethods = this.paymentMethods,
    // lastMessages = this.lastMessages,
    users = this.users,
    status = this.status,
  }) {
    return new P2PRoomModel({
      roomId,
      creationType,
      createdAt,
      updatedAt,
      autoMessage,
      assetLogo,
      fiatLogo,
      paymentMethods,
      // lastMessages,
      users,
      status,
    })
  }

  static fromJson(json) {
    return new P2PRoomModel({
      roomId: json.roomId,
      creationType: json.creationType,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      autoMessage: json.autoMessage,
      assetLogo: json.assetLogo,
      fiatLogo: json.fiatLogo,
      paymentMethods: json.paymentMethods,
      users: json.users,
      status: json.status ?? 1,
    })
  }
}

export default P2PRoomModel;