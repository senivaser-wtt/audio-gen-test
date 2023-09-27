// export abstract class Converter {

//   public output: ReadableStream
//   public input: WritableStream
//   private options: any

//   constructor(options: any) {
//     this.options = options
//   }
// }

interface Converter { }

export class STConverter implements Converter {

}

export abstract class APIController {
  public output: ReadableStream
  public input: WritableStream
  private options: any

  constructor(options: any) {
    this.options = options
  }

}

export class STAPIController extends APIController {

}