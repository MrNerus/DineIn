import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dine-in-and-takeaway-app',
  imports: [],
  templateUrl: './dine-in-and-takeaway.html',
  styleUrl: './dine-in-and-takeaway.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DineInAndTakeawayComponent {
  pdfSrcForTakeAway = 'assets/pdfs/menu.pdf';
  pdfSrcForDineIn = 'assets/pdfs/menu.pdf';

  ngOnInit(): void {
  }

  openTakeAwayPdfInNewTab() {
    window.open(this.pdfSrcForTakeAway, '_blank');
  }
  openDineInPdfInNewTab() {
    window.open(this.pdfSrcForTakeAway, '_blank');
  }
}
