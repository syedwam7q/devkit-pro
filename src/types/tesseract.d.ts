// Type definitions for Tesseract.js
declare module 'tesseract.js' {
  export interface RecognizeResult {
    data: {
      text: string;
      hocr: string;
      tsv: string;
      blocks: any[];
    };
  }

  export interface ProgressMessage {
    status: string;
    progress: number;
    workerId: string;
  }

  export interface Worker {
    load(): Promise<Worker>;
    loadLanguage(language: string): Promise<Worker>;
    initialize(language: string): Promise<Worker>;
    setParameters(params: Record<string, any>): Promise<Worker>;
    recognize(image: File | Blob | ImageData | HTMLImageElement | HTMLCanvasElement | string): Promise<RecognizeResult>;
    detect(image: File | Blob | ImageData | HTMLImageElement | HTMLCanvasElement | string): Promise<any>;
    terminate(): Promise<void>;
    setProgressHandler(handler: (message: ProgressMessage) => void): Worker;
  }

  export interface CreateWorkerOptions {
    corePath?: string;
    langPath?: string;
    workerPath?: string;
    logger?: (message: ProgressMessage) => void;
    errorHandler?: (error: Error) => void;
  }

  export function createWorker(options?: CreateWorkerOptions): Promise<Worker>;
  export function createScheduler(): any;
  export const PSM: Record<string, number>;
  export const OEM: Record<string, number>;
}