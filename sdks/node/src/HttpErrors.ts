/**
 * HookSniff SDK — HTTP Error Models

 */

export class HttpErrorOut {
  code!: string;
  detail!: string;

  static readonly discriminator: string | undefined = undefined;
  static readonly mapping: { [index: string]: string } | undefined = undefined;

  static readonly attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
    format: string;
  }> = [
    { name: "code", baseName: "code", type: "string", format: "" },
    { name: "detail", baseName: "detail", type: "string", format: "" },
  ];

  static getAttributeTypeMap() {
    return HttpErrorOut.attributeTypeMap;
  }
}

export class ValidationError {
  loc!: Array<string>;
  msg!: string;
  type!: string;

  static readonly discriminator: string | undefined = undefined;
  static readonly mapping: { [index: string]: string } | undefined = undefined;

  static readonly attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
    format: string;
  }> = [
    { name: "loc", baseName: "loc", type: "Array<string>", format: "" },
    { name: "msg", baseName: "msg", type: "string", format: "" },
    { name: "type", baseName: "type", type: "string", format: "" },
  ];

  static getAttributeTypeMap() {
    return ValidationError.attributeTypeMap;
  }
}

export class HTTPValidationError {
  detail!: Array<ValidationError>;

  static readonly discriminator: string | undefined = undefined;
  static readonly mapping: { [index: string]: string } | undefined = undefined;

  static readonly attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
    format: string;
  }> = [
    { name: "detail", baseName: "detail", type: "Array<ValidationError>", format: "" },
  ];

  static getAttributeTypeMap() {
    return HTTPValidationError.attributeTypeMap;
  }
}
