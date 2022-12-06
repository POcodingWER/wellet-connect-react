const { google } = require("googleapis");

async function bootstrap() {
  // json 파일을 가지고 인증할 때 다음과 같이 사용합니다.
  // scope는 spread sheet만 주었습니다.
  const authorize = new google.auth.JWT(
    "bellygomtransaction-history@fingerversebeelygom.iam.gserviceaccount.com",
    null,
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCy7SGK2g/S6fHH\nzNfxC0I+emHl+VlAdnbxlf3ojAb3jCCFzpcmtD41h/Z57VFcvfyr9/XtmIs9aOrk\nAQxoeY3aXbmzCt7CwRYgqMUGaT50I0dWwQURZC1jQtafQHk5q4o6Wchar1HlR7EL\nbhjtkkXEyqx2Fbt2BpVSS2t0uZH+l4W6dBxDPD5ahNhO1h/F9FpoWnUl1wzhfzdo\nYU8lZloFtJwdrMypflvSycNm9DqYSt1vw5MDcf7yVgApxCRRDiOQPqS7ow5THysc\nTwGajq7Sgg4jyX4/KWZle/i8GyMdErDc/6MR6rorOIU7L94BUnRn2UeQedC93Noo\nY/AcPgApAgMBAAECggEAAosrP95VYcFj3oCrmxP2t99yvHud9AZUQTGbyf5bVNsV\nubStHg/G1nt7TQA477TWJ7GPMO2dfEXmhmHEJe1cKtwVUCNlUKuJ+KuH1KjAbxNy\n4zcp5dDucdKf5Bt4kki0Q2Th26x2mDE7ryIqBA7hPvZ8yM5BgBdcOZNh+d4mfbaT\nJb9QvXDgqVUJrQp20C+bMewOStc7dE078gzXp8qhIknX/CUd4IuD6yVlPzuho/vV\nOE+G4WSNC8tFTU83gQZrfZ4BRrPXFvUVJR6XU2485m0g0MHQsEbo9oqRUcpF7+F4\nYkDI37gkzJpnrtkaGy2InvCVfpyY3w2+56nebr3b1QKBgQDXM8ks9wqP9SgXEOhJ\n6fzA3hUnUzSmPx/ckKY5/dQXy7CcvltI8c8oFyvYrPTg0hAU+mlLhGJLdH/dO78B\n2E1EOKj9YlKbmflJoYEDYuI9OofOl9yG/aBgBw3XefRMW/fe4dklV+eU65TJwMH1\nFStN6mkxnYdkqf4c6MvqsWOWdQKBgQDU2Mu296tKBs4qRZgRXX7jsQr7wMRzV87k\nzvoJlk4WIOZQzm0iB9RxntEaZM/hEX7ITRvujQZgK4YNktbgerekwZlaahKm4zgq\nD/YJXAOw/dyGpWoIKJydcEqz7ZWjM7DfJeZilPZQfKbX0XlBvpImtA+1Is0JwXwM\nW96IahiUZQKBgDh2euMUUi4hKYqbwgaaoNlNq4ks2JSB3W82eJaglYREyirl+vdx\nkmO3aKaqAnn2Q4fth7DrpAqeH2pBYcUvJl6u6w/IO1peFL0P5dSonilocPdwesjk\nRK7NSwFtGv7p5mgRI7MblERLZzdkHr+Z9Um1JjKBXWO5AlY9cjs6naF9AoGAcHZs\njSyn8OFPpb5H70T7estdBlCAfIF07CkArHgiokaX6zJnL4f7lF1aFxwVStK3rpYv\noAgbyky09A8WQl4VEpTItqE9YbjFQFRWp/Nab/ZywyI7uDvdJMLkddWfLzBs0Dty\nU7xpuXVjor0n2Lkc+B5D/m148SKurMkN9/43JpECgYBWQurIQWqEFy5my6xk5ZoN\nJCRmnoVAVlPxg6Zum4juJk+/0tPuuBuZXRaLhW7QFVDbkAoZ1mMnyKIuXmKEmGdq\nzOJYQYQyaHTM1PZkjtlzZT2179GprlV7M/n7W+NFHacr77VEMA6HAgsPMvEoN72P\nzhFG4IRbjMT24NGIFGBwUw==\n-----END PRIVATE KEY-----\n",
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  // google spread sheet api 가져오기
  const googleSheet = google.sheets({
    version: "v4",
    auth: authorize,
  });

  // const sheetTitle = `22 ${months[1]} Invoice`;
  const requests = {
    updateSheetProperties: {
      properties: {
        sheetId: 1066626559,
        title: sheetTitle,
      },
      fields: "title",
    },
  };
  
  googleSheet.spreadsheets.batchUpdate(
    {
      spreadsheetId: "1ofkgGyQs6W64MJQ4V_bKjUQ7vNhytAGjsh7eVQ8Tu9U",
      resource: { requests },
    },
    (err, response) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Sheet renamed to ${sheetTitle}`);
      }
    }
  );

  const t1 = "₩520";
  const updateData = [
    [
      "ft",
      "0x924Bac06585c1AaCE47955c9Eb0A3F31574daA2c",
      "2022-10-02 9:20:04",
      "102767896",
      "0xae8646615c0f3fe92028e54dc898a318b35e3fe7f6c19f1c71f5bab3d0cdb963",
      "0x41cff281b578f4cf45515d6e4efd535e47e76efd",
      "0x924bac06585c1aace47955c9eb0a3f31574daa2c",
      "WKLAY",
      "680",
      "51",
      "253.636364",
      "₩0",
    ],
    [
      "ft",
      "0x924Bac06585c1AaCE47955c9Eb0A3F31574daA2c",
      "2022-10-02 13:59:48",
      "102784680",
      "0x699e7963fa7f2c04e9d77e8b036df6721941d993c8844e432acb1d92c7846f31",
      "0x41cff281b578f4cf45515d6e4efd535e47e76efd",
      "0x924bac06585c1aace47955c9eb0a3f31574daa2c",
      "WKLAY",
      "690",
      "51.75",
      "254.090909",
      `${t1}`,
    ],
  ];
  // 실제 스프레드시트 내용 가져오기
  const context = await googleSheet.spreadsheets.values.get({
    spreadsheetId: "1ofkgGyQs6W64MJQ4V_bKjUQ7vNhytAGjsh7eVQ8Tu9U",
    range: "opensea!c15:n999",
  });

  const context2 = await googleSheet.spreadsheets.values.update({
    spreadsheetId: "1ofkgGyQs6W64MJQ4V_bKjUQ7vNhytAGjsh7eVQ8Tu9U",
    range: "opensea!C15",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: updateData },
  });
  console.log(context2);
}
// bootstrap();

const findMonth = () => {
    const findnum = 1669257132690
    console.log(new Date(1669258800*1000));
    console.log(new Date().getTime()/ 1000);
    
}
findMonth()
