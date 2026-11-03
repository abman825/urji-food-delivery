import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';


const FRONTEND_URL = process.env.FRONTEND_URL || 'https://urji-food-delivery-lp2l.vercel.app/';


const outputFolder = path.join(process.cwd(), 'qr_codes');

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}


const generateTableQRCodes = async (totalTables = 10) => {
  console.log('🔄 QR ኮዶች በመዘጋጀት ላይ ናቸው...');

  for (let i = 1; i <= totalTables; i++) {
    
    const qrUrl = `${FRONTEND_URL}/?table=${i}`;
    const filePath = path.join(outputFolder, `Table_${i}.png`);

    try {
      await QRCode.toFile(filePath, qrUrl, {
        color: {
          dark: '#1E293B',  
          light: '#FFFFFF' 
        },
        width: 400
      });
      console.log(`✅ QR Code ለ Table ${i} ተፈጠረ: qr_codes/Table_${i}.png`);
    } catch (err) {
      console.error(`❌ Error generating QR for Table ${i}:`, err);
    }
  }

  console.log('\n🎉 ሁሉም QR ኮዶች በ "qr_codes" ፎልደር ውስጥ ተቀምጠዋል!');
};

// Script ሩጥ
generateTableQRCodes(10);