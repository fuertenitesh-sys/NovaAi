const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const audioDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const lines = [
  {
    id: 'support_greeting',
    voice: 'en-US-JennyNeural',
    text: "Hello! Thanks for connecting with Nova Support. I see your express delivery #NC-4928 is out for delivery today. How would you like me to assist you?"
  },
  {
    id: 'support_1',
    voice: 'en-US-JennyNeural',
    text: "Absolutely! I've just sent a direct real-time GPS tracking link to your registered mobile number ending in 4102. You can track the courier vehicle right now."
  },
  {
    id: 'support_2',
    voice: 'en-US-JennyNeural',
    text: "No problem at all! Would you like me to authorize a contactless delivery to your porch, or should I reschedule the delivery for tomorrow morning at 10:00 AM?"
  },
  {
    id: 'support_3',
    voice: 'en-US-JennyNeural',
    text: "Done! I've rescheduled package #NC-4928 for tomorrow between 9:00 AM and 11:30 AM with your local courier hub. Anything else I can do for you?"
  },
  {
    id: 'support_4',
    voice: 'en-US-JennyNeural',
    text: "I understand completely. I am transferring your context and delivery notes directly to senior operations manager Sarah right now. Estimated hold time is under 15 seconds."
  },
  {
    id: 'realestate_greeting',
    voice: 'hi-IN-SwaraNeural',
    text: "Namaste! Welcome to Nova Living. Are you exploring our 3-BHK luxury penthouses in Downtown, or would you like to schedule an exclusive in-person site visit this Saturday?"
  },
  {
    id: 'realestate_1',
    voice: 'hi-IN-SwaraNeural',
    text: "Our 3-BHK skyline penthouses start at 1.85 million dollars with 2,400 square feet of private terrace space and floor-to-ceiling panoramic views. Would you like me to email you the complete floor plan PDF?"
  },
  {
    id: 'realestate_2',
    voice: 'hi-IN-SwaraNeural',
    text: "Confirmed! I've reserved a VIP private viewing for Saturday at 2:00 PM with our senior property director. I will WhatsApp your digital entry pass immediately."
  },
  {
    id: 'realestate_3',
    voice: 'hi-IN-SwaraNeural',
    text: "Yes! We offer a 20:80 flexible construction-linked structure with zero EMI until possession. Would you like me to connect you with our financing specialist?"
  },
  {
    id: 'realestate_4',
    voice: 'hi-IN-SwaraNeural',
    text: "Sending right away! I've dispatched the 2026 Architectural Brochure and Virtual Reality Walkthrough link to your registered mobile number."
  },
  {
    id: 'clinical_greeting',
    voice: 'en-GB-SoniaNeural',
    text: "Hello, this is Dr. Riya from Clinical Concierge. Let's get your doctor consultation or prescription triage arranged immediately. How can I assist with your care today?"
  },
  {
    id: 'clinical_1',
    voice: 'en-GB-SoniaNeural',
    text: "Certainly. Dr. Sharma has open slots this Thursday at 10:15 AM or Friday at 3:30 PM. Which time suits your schedule best?"
  },
  {
    id: 'clinical_2',
    voice: 'en-GB-SoniaNeural',
    text: "I can process that refill immediately with your pharmacy. Is this for Lisinopril 10 milligrams, or your daily inhaler?"
  },
  {
    id: 'clinical_3',
    voice: 'en-GB-SoniaNeural',
    text: "I am logging these symptoms as high priority. A triage nurse is reviewing your vitals and will connect with you in under 90 seconds."
  },
  {
    id: 'clinical_4',
    voice: 'en-GB-SoniaNeural',
    text: "Your insurance coverage with BlueCross BlueShield is active. Your estimated copay for this specialized visit is zero dollars."
  },
  {
    id: 'banking_greeting',
    voice: 'en-US-JennyNeural',
    text: "Nova Security Operations. We've detected an uncharacteristic debit attempt of $1,420 from an unfamiliar terminal in London. Did you authorize this transaction?"
  },
  {
    id: 'banking_1',
    voice: 'en-US-JennyNeural',
    text: "Understood. I have immediately frozen that terminal authorization and blocked card ending in 8819. Zero funds have been deducted from your account."
  },
  {
    id: 'banking_2',
    voice: 'en-US-JennyNeural',
    text: "I've flagged this transaction for your review in the Nova Mobile app. Your card remains active for authorized merchant transactions."
  },
  {
    id: 'banking_3',
    voice: 'en-US-JennyNeural',
    text: "A replacement debit card with contactless voice biometrics has been dispatched via priority overnight courier to your primary address."
  },
  {
    id: 'banking_4',
    voice: 'en-US-JennyNeural',
    text: "Thank you for confirming your voice biometric print. Your security status is verified and all pending holds have been cleared."
  }
];

async function generateAll() {
  console.log(`Generating authentic Riya neural voice files...`);
  const tts = new MsEdgeTTS();

  for (const item of lines) {
    const outFile = path.join(audioDir, `${item.id}.mp3`);
    try {
      await tts.setMetadata(item.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(item.text);
      const writeStream = fs.createWriteStream(outFile);
      audioStream.pipe(writeStream);
      await new Promise((res, rej) => {
        writeStream.on('finish', res);
        writeStream.on('error', rej);
      });
      console.log(`[DONE] ${item.id}.mp3 -> ${fs.statSync(outFile).size} bytes`);
    } catch (err) {
      console.error(`[ERR] ${item.id}:`, err.message);
    }
  }
  console.log('All neural voices successfully generated!');
}

generateAll();
