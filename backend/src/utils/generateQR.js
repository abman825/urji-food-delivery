import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// 1. የ Frontend ድረ-ገጽህ URL (ለጊዜው Localhost ወይም Deploy የተደረገበት URL)
// ለምሳሌ፡ 'https://urji-food.vercel.app' ወይም 'http://192.168.1.5:5173'
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://urji-food-delivery-lp2l.vercel.app/';

// QR ኮዶቹ የሚቀመጡበት Folder
const outputFolder = path.join(process.cwd(), 'qr_codes');

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// 2. ለጠረጴዛዎች QR Code የማመንጨት Function
const generateTableQRCodes = async (totalTables = 10) => {
  console.log('🔄 QR ኮዶች በመዘጋጀት ላይ ናቸው...');

  for (let i = 1; i <= totalTables; i++) {
    // ደንበኛው ስካን ሲያደርግ Table Number ይዞ የሚከፈት Link
    const qrUrl = `${FRONTEND_URL}/?table=${i}`;
    const filePath = path.join(outputFolder, `Table_${i}.png`);

    try {
      await QRCode.toFile(filePath, qrUrl, {
        color: {
          dark: '#1E293B',  // የ QR ኮዱ ቀለም
          light: '#FFFFFF' // የጀርባ ቀለም
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