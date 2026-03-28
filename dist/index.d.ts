interface NumberedCaptionLabels {
    image?: string;
    table?: string;
    stem?: string;
}
interface RegisterOptions {
    chapterLevel?: number | string;
    labels?: NumberedCaptionLabels;
}
interface AsciidoctorDocument {
    getAttribute(name: string): string | undefined;
}
interface AsciidoctorRegistry {
    postprocessor(callback: (this: {
        process: (processor: (document: AsciidoctorDocument, output: string) => string) => void;
    }) => void): void;
}
declare const DEFAULT_LABELS: Required<NumberedCaptionLabels>;
declare function register(registry: AsciidoctorRegistry, options?: RegisterOptions): void;
export { register, DEFAULT_LABELS };
