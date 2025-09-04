import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { PdfViewerModule, PDFDocumentProxy} from 'ng2-pdf-viewer';

@Component({
  selector: 'app-dine-in',
  imports: [PdfViewerModule],
  templateUrl: './dine-in.html',
  styleUrl: './dine-in.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DineInComponent {
  pdfSrc = 'assets/pdfs/menu.pdf';
  
  onPdfError(error: any) {
    console.error('PDF render error:', error);
  }

  ngOnInit(): void {
  }


  zoom = 1; // initial scale
  pdfOriginalWidth = 1

}