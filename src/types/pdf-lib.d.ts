declare module 'pdf-lib' {
  export class PDFDocument {
    static create(): Promise<PDFDocument>;
    static load(bytes: ArrayBuffer | Uint8Array): Promise<PDFDocument>;
    
    save(options?: {
      useObjectStreams?: boolean;
      objectCompressionMethod?: {
        flate?: {
          level?: number;
        };
      };
    }): Promise<Uint8Array>;
    
    getPageCount(): number;
    getPages(): PDFPage[];
  }
  
  export class PDFPage {
    getWidth(): number;
    getHeight(): number;
  }
}