const axios = require('axios');
const chalk = require('chalk');
const readline = require('readline-sync');
const Clone = require('./functions');

function banner() {
  console.clear();
  console.log(chalk.red(`
 
   ███╗   ███╗ █████╗  ██████╗ ███╗   ██╗██╗███████╗
   ████╗ ████║██╔══██╗██╔════╝ ████╗  ██║██║██╔════╝
   ██╔████╔██║███████║██║  ███╗██╔██╗ ██║██║███████╗
   ██║╚██╔╝██║██╔══██║██║   ██║██║╚██╗██║██║╚════██║
   ██║ ╚═╝ ██║██║  ██║╚██████╔╝██║ ╚████║██║███████║
   ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝╚══════╝

  `));
  console.log(chalk.yellow('\t\tSunucu Kopyalayıcı - Magnis Tarafından Yapılmıştır\n'));
}

async function main() {
  banner();

  const toGuildId   = readline.question(chalk.blue('Aktarılacak sunucu ID (Aktarılacak sunucu):\n> ')).trim();
  const fromGuildId = readline.question(chalk.blue('Hedef sunucu ID (kopyalanacak sunucu):\n> ')).trim();
  const token       = readline.question(chalk.blue('\nDiscord tokeniniz:\n> ')).trim();

  try {
    const { data: user } = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: token },
    });
    banner();
    console.log(chalk.green(`\n${user.username} olarak giriş yapıldı.`));
    console.log(chalk.blue('Sunucu kopyalama işlemi başlatılıyor...\n'));
  } catch (e) {
    console.log(chalk.red('\n[✗] Token geçersiz veya giriş yapılamadı.'));
    process.exit(1);
  }

  console.log(chalk.yellow('\nNeleri kopyalamak istiyorsun? (y = evet, n = hayır)\n'));
  const kopyaRol    = readline.question(chalk.blue('Roller kopyalansın mı? (y/n): ')).trim().toLowerCase() === 'y';
  const kopyaKanal  = readline.question(chalk.blue('Kanallar kopyalansın mı? (y/n): ')).trim().toLowerCase() === 'y';
  const kopyaEmoji  = readline.question(chalk.blue('Emojiler kopyalansın mı? (y/n): ')).trim().toLowerCase() === 'y';

  console.log('');

  try {
    await Clone.sunucuKopyala(token, toGuildId, fromGuildId);

    if (kopyaRol) {
      await Clone.rolSil(token, toGuildId);
      await Clone.rolOlustur(token, toGuildId, fromGuildId);
    }

    let kategoriMap = {};
    if (kopyaKanal) {
      await Clone.kanalSil(token, toGuildId);
      kategoriMap = await Clone.kategoriOlustur(token, toGuildId, fromGuildId);
      await Clone.kanalOlustur(token, toGuildId, fromGuildId, kategoriMap);
    }

    if (kopyaEmoji) {
      await Clone.emojiKopyala(token, toGuildId, fromGuildId);
    }

    console.log(chalk.green('\nSunucu başarıyla kopyalandı!'));
  } catch (e) {
    console.log(chalk.red(`\nHata oluştu: ${e.response?.data?.message || e.message}`));
  }
}

main();
