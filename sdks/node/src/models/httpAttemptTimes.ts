export interface HttpAttemptTimes {
  dnsMs?: number;
  connectMs?: number;
  tlsMs?: number;
  processingMs?: number;
  totalMs?: number;
}

export const HttpAttemptTimesSerializer = {
  _fromJsonObject(object: any): HttpAttemptTimes {
    return {
      dnsMs: object["dnsMs"],
      connectMs: object["connectMs"],
      tlsMs: object["tlsMs"],
      processingMs: object["processingMs"],
      totalMs: object["totalMs"],
    };
  },
  _toJsonObject(self: HttpAttemptTimes): any {
    return {
      dnsMs: self.dnsMs,
      connectMs: self.connectMs,
      tlsMs: self.tlsMs,
      processingMs: self.processingMs,
      totalMs: self.totalMs,
    };
  },
};
