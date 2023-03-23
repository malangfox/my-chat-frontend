import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  text = "";

  constructor(
    public chatService: ChatService,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    this.route.queryParams
      .pipe(take(2))
      .subscribe(async (params) => {
        if (params['prodId']) {
          this.chatService.prodId = params['prodId'];
        }
        if (params['conversationSignature']) {
          this.chatService.conversationSignature = params['conversationSignature'];
        }
      });
  }

  send() {
    if (!this.chatService.pending) {
      this.chatService.send(this.text);
      this.text = "";
    }
  }
}
