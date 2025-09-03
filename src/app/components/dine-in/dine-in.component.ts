import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-dine-in',
  imports: [PdfViewerModule],
  templateUrl: './dine-in.html',
  styleUrl: './dine-in.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DineInComponent {
  pdfSrc = 'assets/pdfs/sample.pdf';
}