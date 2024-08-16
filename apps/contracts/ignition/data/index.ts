import * as dotenv from "dotenv";

dotenv.config();
export const adminAccount = process.env.ADMIN_ONE_PK || ''

export const commodityTokens = [
  {
    id: 'createCacao',
    name: 'Cacao',
    symbol: 'CACAO'
  },
  {
    id: 'createGrain',
    name: 'Grain',
    symbol: 'GRAIN'
  },
  {
    id: 'createBasmati',
    name: 'Basmati Rice',
    symbol: 'BASMATI'
  },
  {
    id: 'createCoffee',
    name: 'Coffee Beans',
    symbol: 'COFFEE'
  }
]

export const participantsOnDevnet = [
  {
    id: 'createProducerOne',
    name: 'Producer One',
    account: process.env.PRODUCER_ONE_ACCOUNT || '',
    privateKey: process.env.PRODUCER_ONE_PK || '',
    overheadPercentage: 0,
    type: 0,
    locations: [
      {
        "id": "address.6119152564968138",
        "name": "Calle Manuel Brenes Limón - Limón, 70101, Costa Rica",
        locationType: "address",
        centerLng: -83028619,
        centerLat: 9991082,
      }
    ]
  },
  {
    id: 'createProducerTwo',
    name: 'Producer Two',
    account: process.env.PRODUCER_TWO_ACCOUNT || '',
    privateKey: process.env.PRODUCER_TWO_PK || '',
    overheadPercentage: 0,
    type: 0,
    locations: [
      {
        "id": "address.3511426490985218",
        "name": "Quevedo 3365, Villa Devoto, Buenos Aires, 1417, Argentina",
        locationType: "address",
        centerLng: -58518008,
        centerLat: -34611448,
      }
    ]
  },
  {
    id: 'createProducerThree',
    name: 'Producer Three',
    account: process.env.PRODUCER_THREE_ACCOUNT || '',
    privateKey: process.env.PRODUCER_THREE_PK || '',
    overheadPercentage: 0,
    type: 0,
    locations: [
      {
        "id": "address.2668581517244756",
        "name": "Carrera 38, 810001 Arauca, Arauca, Colombia",
        locationType: "address",
        centerLng: -70770405,
        centerLat: 7077998
      }
    ]
  },
  {
    id: 'createCtfOne',
    name: 'CTF One',
    account: process.env.CTF_ONE_ACCOUNT || '',
    privateKey: process.env.CTF_ONE_PK || '',
    overheadPercentage: 2500,
    type: 1,
    locations: [
      {
        "id": "country.8754",
        "name": "Colombia",
        "locationType": "country",
        centerLng: -73129056,
        centerLat: 3065088
      },
      {
        "id": "country.8774",
        "name": "Spain",
        "locationType": "country",
        centerLat: 41294856,
        centerLng: -4055685,
      }
    ]
  },
  {
    id: 'createCtfTwo',
    name: 'CTF Two',
    account: process.env.CTF_TWO_ACCOUNT || '',
    privateKey: process.env.CTF_TWO_PK || '',
    overheadPercentage: 2500,
    type: 1,
    locations: [
      {
        "id": "country.8715",
        "name": "Argentina",
        "locationType": "country",
        centerLat: -36252002,
        centerLng: -63954193,
      },
      {
        "id": "country.8863",
        "name": "Mexico",
        "locationType": "country",
        centerLat: 23634501,
        centerLng: -102552784
      }
    ]
  },
  {
    id: 'createCtfThree',
    name: 'CTF Three',
    account: process.env.CTF_THREE_ACCOUNT || '',
    privateKey: process.env.CTF_THREE_PK || '',
    overheadPercentage: 2500,
    type: 1,
    locations: [
      {
        "id": "country.8755",
        "name": "Costa Rica",
        "locationType": "country",
        centerLat: 10257794,
        centerLng: -84200915,
      },
      {
        "id": "country.8756",
        "name": "Cuba",
        "locationType": "country",
        centerLat: 21946872,
        centerLng: -79236672,
      }
    ]
  },
  {
    id: 'createConsumerOne',
    name: 'Consumer One',
    account: process.env.CONSUMER_ONE_ACCOUNT || '',
    privateKey: process.env.CONSUMER_ONE_PK || '',
    overheadPercentage: 0,
    type: 2,
    locations: [
      {
        "id": "address.7615197410590374",
        "name": "Ps Maritimo Rey De España 9, 29640 Fuengirola, Málaga, Spain",
        "locationType": "address",
        centerLat: 36534175,
        centerLng: -4623656,
      }
    ]
  },
  {
    id: 'createConsumerTwo',
    name: 'Consumer Two',
    account: process.env.CONSUMER_TWO_ACCOUNT || '',
    privateKey: process.env.CONSUMER_TWO_PK || '',
    overheadPercentage: 0,
    type: 2,
    locations: [
      {
        "id": "address.7516446164196846",
        "name": "Avenida Álvaro Obregón, 94700 Maltrata, Veracruz, Mexico",
        "locationType": "address",
        centerLat: 18805825,
        centerLng: -97274442
      }
    ]
  },
  {
    id: 'createConsumerThree',
    name: 'Consumer Three',
    account: process.env.CONSUMER_THREE_ACCOUNT || '',
    privateKey: process.env.CONSUMER_THREE_PK || '',
    overheadPercentage: 0,
    type: 2,
    locations: [
      {
        "id": "address.6356738517147206",
        "name": "4q Camilo Cienfuegos, Nuevitas, Camagüey, Cuba",
        "locationType": "address",
        centerLat: 21422221,
        centerLng: -77324894
      }
    ]
  }
]

export const localAccounts = [
  adminAccount,
  ...participantsOnDevnet?.map(({ privateKey }) => privateKey),
]

export const listings = [
  {
    id: 'listing_0',
    quantity: 20,
    token: '0x0000000000000000000000000000000000000002',
    producer: participantsOnDevnet?.find(({ id }) => id === 'createProducerOne')?.account,
  },
  {
    id: 'listing_1',
    quantity: 40,
    token: '0x0000000000000000000000000000000000000002',
    producer: participantsOnDevnet?.find(({ id }) => id === 'createProducerTwo')?.account,
  },
  {
    id: 'listing_2',
    quantity: 10,
    token: '0x0000000000000000000000000000000000000002',
    producer: participantsOnDevnet?.find(({ id }) => id === 'createProducerThree')?.account,
  }
]
