import WebSocket from 'ws';

type OrderBookHandler = (bids: string[][], asks: string[][]) => void;

export class BinanceService {
  private ws: WebSocket | null = null;
  private callbacks: OrderBookHandler[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
    // BTC/USDT의 상위 10개 호가만 100ms(0.1초) 단위로 수신
    const STREAM_URL = 'wss://stream.binance.com:9443/ws/btcusdt@depth10@100ms';
    this.ws = new WebSocket(STREAM_URL);

    this.ws.on('open', () => {
      console.log('✅ Connected to Binance WebSocket');
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.bids && parsed.asks) {
        this.notify(parsed.bids, parsed.asks);
      }
    });

    this.ws.on('close', () => {
      console.log('⚠️ Binance Disconnected. Reconnecting...');
      setTimeout(() => this.connect(), 1000);
    });

    this.ws.on('error', (error) => {
      console.error('❌ Binance WebSocket Error:', error);
    });
  }

  // 구독자 패턴: 데이터를 원하는 게임 엔진에 뿌려줌
  public subscribe(callback: OrderBookHandler) {
    this.callbacks.push(callback);
  }

  private notify(bids: string[][], asks: string[][]) {
    this.callbacks.forEach(cb => cb(bids, asks));
  }
}

// 싱글톤으로 내보내기 (서버 전체에서 하나만 연결)
export const binanceService = new BinanceService();
