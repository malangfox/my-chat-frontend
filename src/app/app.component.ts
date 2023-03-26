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
  ) { }

  async ngOnInit() {
    const conversation = await this.chatService.createConversation();
    console.log(conversation);
    this.chatService.conversationId = conversation.conversationId
    this.chatService.clientId = conversation.clientId
    this.chatService.conversationSignature = conversation.conversationSignature
    this.chatService.pending = false;
  }

  send() {
    if (!this.chatService.pending) {
      this.chatService.send(this.text);
      setTimeout(() => {
        this.text = "";
      }, 100);
    }
  }
}
