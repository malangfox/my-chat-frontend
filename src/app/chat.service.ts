import { Injectable } from '@angular/core';

@Injectable()
export class ChatService {
  public pending = true;
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
  public conversationId: string = '';
  public clientId: string = '';
  public conversationSignature: string = '';
  index: number = 0;
  cookie: string = "1OLDP06zegvrWUyQ4TqIDdL4cdXhq97qPH6lMnKUbDMaklS6SMrmogQkyod8_P15tvtCCpFw-N8-3h7YiOPft5_DK_xcRB0wzfE1k5WmhqZSt5e1_9dKs6MckEFcW8nWoOw0VW-wSVJIdrviUBo1-cIsOBjrf74bJdTQUXZ-_JjGJs7vHAkmfBkUes_A9OaRfJZ1zWaV9pYw29RnzeZwe0SrriWcVeBt2ojf_fcDjxtE";
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
    const ws = new WebSocket('wss://sydney.bing.com/sydney/ChatHub');
    ws.onopen = () => {
      ws.send('{"protocol":"json","version":1}');
      ws.send('{"type":6}');
      ws.send(
        `{"arguments":[{"source":"cib","optionsSets":["nlu_direct_response_filter","deepleo","disable_emoji_spoken_text","responsible_ai_policy_235","enablemm","galileo","newspoleansgnd","h3toppfp2","wlthrottle","serploc","cachewriteext","e2ecachewrite","dv3sugg"],"allowedMessageTypes":["Chat","InternalSearchQuery","InternalSearchResult","Disengaged","InternalLoaderMessage","RenderCardRequest","AdsQuery","SemanticSerp","GenerateContentQuery","SearchQuery"],"sliceIds":["anidtestcf","norbingchrome","styleqnatg","sydpayajaxlog","toneexp","321toppfp2","314sdprc","314sdprc","0310wlthrot","320newspole","321bic62s0","saharasscf","321sloc","316e2ecache"],"verbosity":"verbose","traceId":"641c024c84bb4fb695e44648aa51f069","isStartOfSession":${this.index === 0},"message":{"locale":"ko-KR","market":"ko-KR","region":"KR","location":"lat:47.639557;long:-122.128159;re=1000m;","locationHints":[{"country":"Korea (South)","state":"Seoul","city":"Seoul","zipcode":"047","timezoneoffset":9,"countryConfidence":8,"cityConfidence":8,"Center":{"Latitude":37.5683,"Longitude":126.9978},"RegionType":2,"SourceType":1}],"timestamp":"2023-03-23T16:39:58+09:00","author":"user","inputMethod":"Keyboard","text":"${text}","messageType":"Chat"},"conversationSignature":"${this.conversationSignature}","participant":{"id":"${this.clientId}"},"conversationId":"${this.conversationId}"}],"invocationId":"${this.index}","target":"chat","type":4}`
      );
    };
    ws.onmessage = (event) => this.onMessage(event);
  }

  onMessage(event: any) {
    const data = JSON.parse(event.data.split('')[0]);
    console.log(data);
    if (data.arguments) {
      if (data.arguments[0].throttling?.numUserMessagesInConversation) {
        this.chat[this.index].num =
          data.arguments[0].throttling.numUserMessagesInConversation;
      }
      if (data.arguments[0].messages) {
        console.log(data.arguments[0].messages);
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
      console.log(data);
      if (data.result) {
        this.chat[this.index].think.push(`횟수가 초과되었습니다.`);
      }
      if (data.item && data.item.messages) {
        console.log(data.item.messages);
        const message = data.item.messages.find(message => message.adaptiveCards);
        console.log(message);
      }
      this.pending = false;
      ++this.index;
    }
  }

  async createConversation() {
    const requestId = crypto.randomUUID()

    const cookie = this.cookie.includes(';')
      ? this.cookie
      : `_U=${this.cookie}`;

    return fetch('https://www.bing.com/turing/conversation/create', {
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US,en;q=0.9',
//        'content-type': 'application/json',
        'sec-ch-ua':
          '"Not_A Brand";v="99", "Microsoft Edge";v="109", "Chromium";v="109"',
        'sec-ch-ua-arch': '"x86"',
        'sec-ch-ua-bitness': '"64"',
        'sec-ch-ua-full-version': '"109.0.1518.78"',
        'sec-ch-ua-full-version-list':
          '"Not_A Brand";v="99.0.0.0", "Microsoft Edge";v="109.0.1518.78", "Chromium";v="109.0.5414.120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-model': '',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-platform-version': '"12.6.0"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
//        'x-ms-client-request-id': requestId,
//        'x-ms-useragent': 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/MacIntel',
        cookie
      },
      referrer: 'https://www.bing.com/search',
      referrerPolicy: 'origin-when-cross-origin',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    }).then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(
          `unexpected HTTP error createConversation ${res.status}: ${res.statusText}`
        )
      }
    })
  }
}
