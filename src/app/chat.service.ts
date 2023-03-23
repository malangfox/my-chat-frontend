import { Injectable } from '@angular/core';

@Injectable()
export class ChatService {
  public pending = false;
  public chat: {
    me: string;
    think: string[];
    you: string;
    num: number;
    learnMore: {
      short: string;
      link: string;
    }[];
  }[] = [];
  // http://localhost:4200/chat?prodId=04FBED0E9135EDB1C42A0ACFD00AF77D6F7FAA7CC2D9144DC4C0BF4F571CF296&conversationSignature=/bbOBKvxWjiMAl38y0cq0nBfSeDGNDAfkh41ogl8fuM=
  public prodId: string = '';
  public conversationSignature: string = '';
  index: number = 0;
  ws: WebSocket;

  constructor() {}

  send(text: string) {
    this.pending = true;
    this.chat.push({
      me: text,
      think: [],
      you: '',
      num: 0,
      learnMore: [],
    });
    this.ws = new WebSocket('wss://sydney.bing.com/sydney/ChatHub');
    this.ws.onopen = () => {
      this.ws.send('{"protocol":"json","version":1}');
      this.ws.send('{"type":6}');
      this.ws.send(
        `{"arguments":[{"source":"cib","optionsSets":["nlu_direct_response_filter","deepleo","disable_emoji_spoken_text","responsible_ai_policy_235","enablemm","galileo","newspoleansgnd","h3toppfp2","wlthrottle","serploc","cachewriteext","e2ecachewrite","dv3sugg"],"allowedMessageTypes":["Chat","InternalSearchQuery","InternalSearchResult","Disengaged","InternalLoaderMessage","RenderCardRequest","AdsQuery","SemanticSerp","GenerateContentQuery","SearchQuery"],"sliceIds":["anidtestcf","norbingchrome","styleqnatg","sydpayajaxlog","toneexp","321toppfp2","314sdprc","314sdprc","0310wlthrot","320newspole","321bic62s0","saharasscf","321sloc","316e2ecache"],"verbosity":"verbose","traceId":"641c024c84bb4fb695e44648aa51f069","isStartOfSession":false,"message":{"locale":"ko-KR","market":"ko-KR","region":"KR","location":"lat:47.639557;long:-122.128159;re=1000m;","locationHints":[{"country":"Korea (South)","state":"Seoul","city":"Seoul","zipcode":"047","timezoneoffset":9,"countryConfidence":8,"cityConfidence":8,"Center":{"Latitude":37.5683,"Longitude":126.9978},"RegionType":2,"SourceType":1}],"timestamp":"2023-03-23T16:39:58+09:00","author":"user","inputMethod":"Keyboard","text":"${text}","messageType":"Chat"},"conversationSignature":"${this.conversationSignature}","participant":{"id":"985157498223893"},"conversationId":"51D|BingProd|${this.prodId}"}],"invocationId":"1","target":"chat","type":4}`
      );
    };
    this.ws.onmessage = (event) => this.onMessage(event);
  }

  onMessage(event: any) {
    const data = JSON.parse(event.data.split('')[0]);
    if (data.arguments) {
      if (data.arguments[0].throttling?.numUserMessagesInConversation) {
        this.chat[this.index].num =
          data.arguments[0].throttling.numUserMessagesInConversation;
      }
      if (data.arguments[0].messages) {
        const response = data.arguments[0].messages[0];
        if (response.messageType === 'InternalSearchQuery') {
          this.chat[this.index].think.push(
            `“<b>${response.hiddenText}</b>” 검색 중`
          );
        } else if (response.messageType === 'InternalLoaderMessage') {
          this.chat[this.index].think.push(`답변을 생성하는 중…`);
        } else if (response.messageType === 'RenderCardRequest') {
        } else {
          this.chat[this.index].you = response.text;
        }
      }
    }
    if (data.type === 2) {
      if (data.result) {
        this.chat[this.index].think.push(`횟수가 초과되었습니다.`);
      }
      if (data.item && data.item.messages) {
        const message = data.item.messages.find(message => message.adaptiveCards);
      }
      this.pending = false;
      ++this.index;
      this.ws.close();
    }
  }
}
