import dns from 'dns';
import mongoose from 'mongoose';
import { PlatformSettingsModel } from '../src/lib/db/models';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function updateSettings() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const result = await PlatformSettingsModel.updateOne(
    { _id: 'settings_default' },
    { supportPhone: '+258 86 697 9225' }
  );
  console.log('settings_default updated:', result);
  await mongoose.disconnect();
}

updateSettings().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
