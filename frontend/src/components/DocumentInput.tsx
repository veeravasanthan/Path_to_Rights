/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { SAMPLE_DOCUMENTS, SampleDocument, Language } from '../types';
import { FileText, Upload, Sparkles, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { UI_TRANSLATIONS } from '../translations';

interface DocumentInputProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  documentImage: string | null;
  setDocumentImage: (img: string | null) => void;
  documentPdf: string | null;
  setDocumentPdf: (pdf: string | null) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  selectedLanguage: Language;
}

export default function DocumentInput({
  documentText,
  setDocumentText,
  documentImage,
  setDocumentImage,
  documentPdf,
  setDocumentPdf,
  onAnalyze,
  isLoading,
  selectedLanguage
}: DocumentInputProps) {
  const t = UI_TRANSLATIONS[selectedLanguage.code] || UI_TRANSLATIONS['en'];
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please upload an image file (PNG, JPG, or JPEG) or a PDF of your document.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (file.type === 'application/pdf') {
          setDocumentPdf(reader.result);
          setDocumentImage(null);
        } else {
          setDocumentImage(reader.result);
          setDocumentPdf(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const loadSample = (sample: SampleDocument) => {
    setDocumentText(sample.content);
    setDocumentImage(null);
    setDocumentPdf(null);
    setFileName(null);
  };

  const clearInputs = () => {
    setDocumentText('');
    setDocumentImage(null);
    setDocumentPdf(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasUploadedFile = !!documentImage || !!documentPdf;
  const hasContent = !!documentText || hasUploadedFile;

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-5">
      {/* Sample presets */}
      <div>
        <span className="font-sans font-medium text-xs text-stone-500 uppercase tracking-wider block mb-2.5 animate-fade-in">
          {t.samplePresets}
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <button
              key={sample.id}
              id={`sample-doc-${sample.id}`}
              onClick={() => loadSample(sample)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-150 bg-stone-50/50 text-stone-700 hover:bg-stone-50 hover:border-amber-400 text-xs font-medium cursor-pointer transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative border-t border-stone-100 my-1 font-sans text-xs text-stone-400 text-center">
        <span className="bg-white px-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{t.orLabel}</span>
      </div>

      {/* Upload files */}
      <div>
        <span className="font-sans font-medium text-xs text-stone-500 uppercase tracking-wider block mb-2.5">
          {t.uploadTitle}
        </span>
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-amber-500 bg-amber-50/20'
              : hasUploadedFile
              ? 'border-emerald-500 bg-emerald-50/5'
              : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {hasUploadedFile ? (
            <div className="flex flex-col items-center gap-2">
              <div className={`size-10 ${documentPdf ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'} rounded-full flex items-center justify-center`}>
                {documentPdf ? <FileText className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  {documentPdf ? "PDF Document loaded!" : t.photoSelectedText}
                </p>
                <p className="text-xs text-stone-500 font-mono mt-0.5 max-w-[250px] truncate">
                  {fileName || (documentPdf ? 'document.pdf' : 'document_image.jpg')}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearInputs();
                }}
                className="text-[11px] text-red-500 hover:underline mt-1 font-sans cursor-pointer"
              >
                {t.removeFile}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 font-sans">
              <Upload className="w-6 h-6 text-stone-400 group-hover:text-amber-500 transition-colors" />
              <p className="text-xs font-medium text-stone-700">
                {t.dragDropText}
              </p>
              <p className="text-[10px] text-stone-400">{t.dragDropSub} • PDF files are also supported</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual document paste */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-sans font-medium text-xs text-stone-500 uppercase tracking-wider">
            {t.pasteTextLabel}
          </span>
          {documentText && (
            <button
              onClick={clearInputs}
              className="text-[11px] text-stone-400 hover:text-red-500 font-sans cursor-pointer"
            >
              {t.clearText}
            </button>
          )}
        </div>
        <textarea
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          placeholder={t.pastePlaceholder}
          rows={6}
          className="w-full rounded-xl border border-stone-200/80 px-3.5 py-2.5 text-sm outline-hidden focus:border-amber-400 hover:border-stone-300 focus:ring-3 focus:ring-amber-500/5 transition-all text-stone-800 font-sans leading-relaxed resize-none"
        />
      </div>

      {/* Submit button */}
      <button
        id="analyze-document-btn"
        onClick={onAnalyze}
        disabled={isLoading || !hasContent}
        className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all focus:ring-4 focus:ring-amber-200 cursor-pointer ${
          isLoading
            ? 'bg-amber-100 text-amber-700 cursor-not-allowed'
            : !hasContent
            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-550 to-amber-600 text-white font-semibold hover:shadow-md active:-translate-y-0.5'
        }`}
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t.analyzingBtn}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>{t.analyzeBtn}</span>
          </>
        )}
      </button>

      {/* Disclaimer */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 flex gap-2.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-stone-500 leading-normal">
          {t.warningDisclaimer}
        </p>
      </div>
    </div>
  );
}
