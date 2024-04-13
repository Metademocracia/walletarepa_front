export const MessageSpecialId = {
  system: "system",
  operator: "operator"
}

export const MessageType = {
  text: 'text',
  image: 'image',
  file: 'file'
}

export const MessageStatus = {
  sent: 'sent',
  sending: 'sending',
  failed: 'failed'
}

export class MessageModel {
  constructor({
    authorId,
    createdAt,
    status,
    text,
    type,
    updatedAt,
  }) {
    this.authorId = authorId;
    this.createdAt = createdAt;
    this.status = status;
    this.text = text;
    this.type = type;
    this.updatedAt = updatedAt;
  }

  copyWith({
    authorId,
    createdAt,
    status,
    text,
    type,
    updatedAt
  }) {
    return new MessageModel({
      authorId: authorId ?? this.authorId,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      text: text ?? this.text,
      type: type ?? this.type,
      updatedAt: updatedAt ?? this.updatedAt,
    });
  }

  toJson() {
    if (this.authorId === "system") return SystemMessage.fromJson(this).toJson();
    else if (this.type === "image") return ImageMessage.fromJson(this).toJson();
    else if (this.type === "file") return FileMessage.fromJson(this).toJson();
    return {
      authorId: this.authorId,
      createdAt: this.createdAt,
      text: this.text,
      type: this.type,
      updatedAt: this.updatedAt,
    };
  }

  static fromJson(json) {
    if (json.authorId === "system") return SystemMessage.fromJson(json);
    else if (json.type === "image") return ImageMessage.fromJson(json);
    else if (json.type === "file") return FileMessage.fromJson(json);
    return new MessageModel({
      authorId: json.authorId,
      createdAt: json.createdAt,
      status: json.status,
      text: json.text,
      type: json.type,
      updatedAt: json.updatedAt,
    });
  }
}

export class SystemMessage {
  constructor({
    authorId,
    createdAt,
    status,
    text,
  }) {
    this.authorId = authorId;
    this.createdAt = createdAt;
    this.status = status;
    this.text = text;
  }

  copyWith({
    authorId,
    createdAt,
    status,
    text
  }) {
    return new SystemMessage({
      authorId: authorId ?? this.authorId,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      text: text ?? this.text,
    });
  }

  toJson() {
    return {
      authorId: this.authorId,
      createdAt: this.createdAt,
      status: this.status,
      text: this.text,
    };
  }

  static fromJson(json) {
    return new SystemMessage({
      authorId: json.authorId,
      createdAt: json.createdAt,
      status: json.status,
      text: json.text,
    });
  }
}

export class ImageMessage {
  constructor({
    authorId,
    createdAt,
    status,
    type,
    updatedAt,
    height,
    name,
    size,
    uri,
    width,
  }) {
    this.authorId = authorId;
    this.createdAt = createdAt;
    this.status = status;
    this.type = type;
    this.updatedAt = updatedAt;
    this.height = height;
    this.name = name;
    this.size = size;
    this.uri = uri;
    this.width = width;
  }

  copyWith({
    authorId,
    createdAt,
    status,
    type,
    updatedAt,
    height,
    name,
    size,
    uri,
    width,
  }) {
    return new ImageMessage({
      authorId: authorId ?? this.authorId,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      type: type ?? this.type,
      updatedAt: updatedAt ?? this.updatedAt,
      height: height ?? this.height,
      name: name ?? this.name,
      size: size ?? this.size,
      uri: uri ?? this.uri,
      width: width ?? this.width,
    });
  }

  toJson() {
    return {
      authorId: this.authorId,
      createdAt: this.createdAt,
      status: this.status,
      type: this.type,
      updatedAt: this.updatedAt,
      height: this.height,
      name: this.name,
      size: this.size,
      uri: this.uri,
      width: this.width,
    };
  }

  static fromJson(json) {
    return new ImageMessage({
      authorId: json.authorId,
      createdAt: json.createdAt,
      status: json.status,
      type: json.type,
      updatedAt: json.updatedAt,
      height: json.height,
      name: json.name,
      size: json.size,
      uri: json.uri,
      width: json.width,
    });
  }
}

export class FileMessage {
  constructor({
    authorId,
    createdAt,
    status,
    type,
    updatedAt,
    mimeType,
    name,
    size,
    uri,
  }) {
    this.authorId = authorId;
    this.createdAt = createdAt;
    this.status = status;
    this.type = type;
    this.updatedAt = updatedAt;
    this.mimeType = mimeType;
    this.name = name;
    this.size = size;
    this.uri = uri;
  }

  copyWith({
    authorId,
    createdAt,
    status,
    type,
    updatedAt,
    mimeType,
    name,
    size,
    uri
  }) {
    return new FileMessage({
      authorId: authorId ?? this.authorId,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      type: type ?? this.type,
      updatedAt: updatedAt ?? this.updatedAt,
      mimeType: mimeType ?? this.mimeType,
      name: name ?? this.name,
      size: size ?? this.size,
      uri: uri ?? this.uri,
    });
  }

  toJson() {
    return {
      authorId: this.authorId,
      createdAt: this.createdAt,
      status: this.status,
      type: this.type,
      updatedAt: this.updatedAt,
      mimeType: this.mimeType,
      name: this.name,
      size: this.size,
      uri: this.uri,
    };
  }

  static fromJson(json) {
    return new FileMessage({
      authorId: json.authorId,
      createdAt: json.createdAt,
      status: json.status,
      type: json.type,
      updatedAt: json.updatedAt,
      mimeType: json.mimeType,
      name: json.name,
      size: json.size,
      uri: json.uri,
    })
  }
}