import type { AdCreative, Message, PatientThread } from "@/lib/types";

// Ad creatives (Module F). Prices are stored in GBP and converted to the viewer's currency.
export const adCreatives: AdCreative[] = [
  {
    id: "ad-probiotic",
    advertiser: "WHP Store",
    headline: "Gut Health Probiotic Complex",
    body: "Daily support formulated for women's wellbeing.",
    cta: "Shop now",
    priceGBP: 34.99,
    tone: "primary",
  },
  {
    id: "ad-multivitamin",
    advertiser: "WHP Store",
    headline: "Women's Multivitamin Formula",
    body: "Iron, folate and B vitamins in one daily tablet.",
    cta: "Learn more",
    priceGBP: 29.99,
    tone: "secondary",
  },
  {
    id: "ad-bladder-check",
    advertiser: "GyneClinics",
    headline: "Bladder Health Check",
    body: "A specialist-led assessment at our pelvic health centre.",
    cta: "Find out more",
    priceGBP: 150,
    tone: "gold",
  },
  {
    id: "ad-enzyme",
    advertiser: "WHP Store",
    headline: "Digestive Enzyme Support",
    body: "Gentle support for bloating across your cycle.",
    cta: "Shop now",
    priceGBP: 24.99,
    tone: "accent",
  },
];

// Doctor-side patient threads (Module E, doctor view).
export const patientThreads: PatientThread[] = [
  { id: "t-sara", patientName: "Sara K.", age: 29, topic: "Irregular cycles", hue: 330, status: "active" },
  { id: "t-mina", patientName: "Mina R.", age: 34, topic: "Trying to conceive", hue: 186, status: "waiting" },
  { id: "t-joanne", patientName: "Joanne P.", age: 47, topic: "Perimenopause symptoms", hue: 260, status: "active" },
  { id: "t-hana", patientName: "Hana A.", age: 31, topic: "Baby growth scan questions", hue: 25, status: "waiting" },
  { id: "t-olivia", patientName: "Olivia W.", age: 22, topic: "Painful periods", hue: 160, status: "closed" },
];

// Seed messages keyed by conversation id. Patient conversations use the doctor id;
// doctor conversations use the thread id.
export const seedMessages: Record<string, Message[]> = {
  "amelia-hart": [
    { id: "m1", from: "patient", text: "Hello doctor, my last two cycles were 38 and 41 days. Is that something to worry about?", at: "2026-10-18T09:12:00Z" },
    { id: "m2", from: "doctor", text: "Hello! Thanks for sharing your tracked dates — that's really helpful. Cycles over 35 days can happen occasionally. Have you noticed any changes in stress, sleep or weight recently?", at: "2026-10-18T09:20:00Z" },
    { id: "m3", from: "patient", text: "Work has been quite stressful, and I've been sleeping less.", at: "2026-10-18T09:24:00Z" },
    { id: "m4", from: "doctor", text: "That can certainly shift timing. Keep logging for the next two cycles. If they stay above 35 days, I'd suggest an in-person review so we can look into it properly.", at: "2026-10-18T09:31:00Z" },
  ],
  "nadia-rahman": [
    { id: "m1", from: "patient", text: "Hi, my app shows my fertile window from the 3rd to the 9th. How accurate is that?", at: "2026-10-16T14:02:00Z" },
    { id: "m2", from: "doctor", text: "Hi! It's an estimate based on your logged cycles, so it's a good guide but not exact. Your cycles look fairly regular, which helps.", at: "2026-10-16T14:15:00Z" },
  ],
  "t-sara": [
    { id: "m1", from: "patient", text: "Hello doctor, my last two cycles were 38 and 41 days. Is that something to worry about?", at: "2026-10-19T09:12:00Z" },
    { id: "m2", from: "doctor", text: "Hello Sara, thanks for sharing your tracked dates. Have there been any changes in stress, sleep or weight recently?", at: "2026-10-19T09:20:00Z" },
    { id: "m3", from: "patient", text: "Work has been quite stressful, and I've been sleeping less.", at: "2026-10-19T09:24:00Z" },
  ],
  "t-mina": [
    { id: "m1", from: "patient", text: "Hi, we've been trying for 7 months. My cycles are 27–29 days. When should we get checked?", at: "2026-10-20T07:40:00Z" },
  ],
  "t-joanne": [
    { id: "m1", from: "patient", text: "I'm 47 and having night sweats and much heavier periods. Could this be perimenopause?", at: "2026-10-19T18:05:00Z" },
    { id: "m2", from: "doctor", text: "Those symptoms are very common in perimenopause. Can you tell me how long your recent cycles have been?", at: "2026-10-19T18:30:00Z" },
    { id: "m3", from: "patient", text: "Between 22 and 26 days for the last few months.", at: "2026-10-19T18:41:00Z" },
  ],
  "t-hana": [
    { id: "m1", from: "patient", text: "My 28 week scan says estimated weight 1.1kg. Is that okay?", at: "2026-10-20T06:15:00Z" },
  ],
  "t-olivia": [
    { id: "m1", from: "patient", text: "My period pain is really bad on the first day.", at: "2026-10-10T11:00:00Z" },
    { id: "m2", from: "doctor", text: "I'm sorry to hear that. Heat and gentle movement can help, but severe pain is worth a proper review. I'd recommend booking an in-person appointment.", at: "2026-10-10T11:20:00Z" },
    { id: "m3", from: "patient", text: "Thank you, I'll book one.", at: "2026-10-10T11:26:00Z" },
  ],
};
