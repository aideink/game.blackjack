class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    toString() {
        return `${this.value} of ${this.suit}`;
    }

    getSuitSymbol() {
        const symbols = {
            'Hearts': '♥',
            'Diamonds': '♦',
            'Clubs': '♣',
            'Spades': '♠'
        };
        return symbols[this.suit];
    }

    getColor() {
        return ['Hearts', 'Diamonds'].includes(this.suit) ? 'red' : 'black';
    }

    createCardElement() {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card dealing';
        
        const valueDiv = document.createElement('div');
        valueDiv.className = `card-value ${this.getColor()}`;
        valueDiv.textContent = this.value;
        
        const valueBottomDiv = document.createElement('div');
        valueBottomDiv.className = `card-value-bottom ${this.getColor()}`;
        valueBottomDiv.textContent = this.value;
        
        const suitDiv = document.createElement('div');
        suitDiv.className = `card-suit ${this.getColor()}`;
        suitDiv.textContent = this.getSuitSymbol();
        
        cardDiv.appendChild(valueDiv);
        cardDiv.appendChild(suitDiv);
        cardDiv.appendChild(valueBottomDiv);
        
        setTimeout(() => {
            cardDiv.classList.remove('dealing');
        }, 500);
        
        return cardDiv;
    }
}

class Deck {
    constructor() {
        this.reset();
    }

    reset() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.cards = [];

        for (let suit of suits) {
            for (let value of values) {
                this.cards.push(new Card(suit, value));
            }
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        return this.cards.pop();
    }
}

class Game {
    constructor() {
        this.deck = new Deck();
        this.playerHand = [];
        this.dealerHand = [];
        this.gameOver = true;

        // DOM elements
        this.startBtn = document.getElementById('start-btn');
        this.hitBtn = document.getElementById('hit-btn');
        this.standBtn = document.getElementById('stand-btn');
        this.playerCards = document.getElementById('player-cards');
        this.dealerCards = document.getElementById('dealer-cards');
        this.playerSum = document.getElementById('player-sum');
        this.dealerSum = document.getElementById('dealer-sum');
        this.messages = document.getElementById('messages');

        // Event listeners
        this.startBtn.addEventListener('click', () => this.startGame());
        this.hitBtn.addEventListener('click', () => this.hit());
        this.standBtn.addEventListener('click', () => this.stand());
    }

    startGame() {
        this.gameOver = false;
        this.deck.reset();
        this.playerHand = [];
        this.dealerHand = [];
        
        // Deal initial cards
        this.playerHand.push(this.deck.deal(), this.deck.deal());
        this.dealerHand.push(this.deck.deal(), this.deck.deal());

        // Update UI
        this.updateUI();
        this.startBtn.disabled = true;
        this.hitBtn.disabled = false;
        this.standBtn.disabled = false;
        this.messages.textContent = '';
    }

    calculateHand(hand) {
        let sum = 0;
        let aces = 0;

        for (let card of hand) {
            if (card.value === 'A') {
                aces += 1;
                sum += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                sum += 10;
            } else {
                sum += parseInt(card.value);
            }
        }

        while (sum > 21 && aces > 0) {
            sum -= 10;
            aces -= 1;
        }

        return sum;
    }

    updateUI() {
        // Clear existing cards
        this.playerCards.innerHTML = '';
        this.dealerCards.innerHTML = '';

        // Display player's cards with delay
        this.playerHand.forEach((card, index) => {
            setTimeout(() => {
                this.playerCards.appendChild(card.createCardElement());
            }, index * 200);
        });
        this.playerSum.textContent = this.calculateHand(this.playerHand);

        // Display dealer's cards with delay
        if (this.gameOver) {
            this.dealerHand.forEach((card, index) => {
                setTimeout(() => {
                    this.dealerCards.appendChild(card.createCardElement());
                }, index * 200);
            });
            this.dealerSum.textContent = this.calculateHand(this.dealerHand);
        } else {
            setTimeout(() => {
                this.dealerCards.appendChild(this.dealerHand[0].createCardElement());
            }, 0);
            
            setTimeout(() => {
                const hiddenCard = document.createElement('div');
                hiddenCard.className = 'card dealing';
                hiddenCard.style.background = 'linear-gradient(135deg, #b71234, #8b0000)';
                hiddenCard.style.boxShadow = '2px 2px 8px rgba(0, 0, 0, 0.3)';
                
                const pattern = document.createElement('div');
                pattern.style.position = 'absolute';
                pattern.style.top = '50%';
                pattern.style.left = '50%';
                pattern.style.transform = 'translate(-50%, -50%)';
                pattern.style.fontSize = '2em';
                pattern.style.color = 'rgba(255, 255, 255, 0.1)';
                pattern.textContent = '♠♣♥♦';
                
                hiddenCard.appendChild(pattern);
                this.dealerCards.appendChild(hiddenCard);
            }, 200);
            
            this.dealerSum.textContent = '?';
        }
    }

    hit() {
        this.playerHand.push(this.deck.deal());
        const playerTotal = this.calculateHand(this.playerHand);

        if (playerTotal > 21) {
            this.endGame('You bust! Dealer wins!');
            return;
        }

        this.updateUI();
    }

    stand() {
        this.gameOver = true;
        
        while (this.calculateHand(this.dealerHand) < 17) {
            this.dealerHand.push(this.deck.deal());
        }

        const playerTotal = this.calculateHand(this.playerHand);
        const dealerTotal = this.calculateHand(this.dealerHand);

        if (dealerTotal > 21) {
            this.endGame('Dealer busts! You win!');
        } else if (dealerTotal > playerTotal) {
            this.endGame('Dealer wins!');
        } else if (playerTotal > dealerTotal) {
            this.endGame('You win!');
        } else {
            this.endGame("It's a tie!");
        }
    }

    endGame(message) {
        this.gameOver = true;
        this.hitBtn.disabled = true;
        this.standBtn.disabled = true;
        this.startBtn.disabled = false;
        
        const messageElement = document.getElementById('messages');
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            messageElement.textContent = message;
            messageElement.style.transition = 'all 0.5s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, 300);
        
        this.updateUI();
    }
}

// Start the game when the page loads
const game = new Game(); 