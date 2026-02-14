export type Language = 'nl' | 'en' | 'fr' | 'de';

export const translations = {
  // Navigation
  nav: {
    features: { nl: 'Functies', en: 'Features', fr: 'Fonctionnalités', de: 'Funktionen' },
    howItWorks: { nl: 'Hoe het werkt', en: 'How it works', fr: 'Comment ça marche', de: 'So funktioniert es' },
    pricing: { nl: 'Prijzen', en: 'Pricing', fr: 'Tarifs', de: 'Preise' },
    contact: { nl: 'Contact', en: 'Contact', fr: 'Contact', de: 'Kontakt' },
    aboutUs: { nl: 'Over ons', en: 'About us', fr: 'À propos', de: 'Über uns' },
    login: { nl: 'Inloggen', en: 'Log in', fr: 'Connexion', de: 'Anmelden' },
    tryFree: { nl: 'Gratis proberen', en: 'Try for free', fr: 'Essayer gratuitement', de: 'Kostenlos testen' },
    backToHome: { nl: 'Terug naar home', en: 'Back to home', fr: 'Retour à l\'accueil', de: 'Zurück zur Startseite' },
  },

  // Hero Section
  hero: {
    badge: { nl: 'Nu met 7 dagen gratis proefperiode', en: 'Now with 7 days free trial', fr: 'Maintenant avec 7 jours d\'essai gratuit', de: 'Jetzt mit 7 Tagen kostenloser Testphase' },
    title1: { nl: 'Uw eigen', en: 'Your own', fr: 'Votre propre', de: 'Ihr eigener' },
    titleHighlight: { nl: 'slimme receptionist', en: 'smart receptionist', fr: 'réceptionniste intelligent', de: 'smarter Rezeptionist' },
    title2: { nl: 'aan de telefoon', en: 'on the phone', fr: 'au téléphone', de: 'am Telefon' },
    subtitle: { nl: 'VoxApp beantwoordt uw telefoontjes 24/7, boekt afspraken automatisch in en beantwoordt veelgestelde vragen. Nooit meer een gemiste oproep.', en: 'VoxApp answers your calls 24/7, automatically books appointments and answers frequently asked questions. Never miss a call again.', fr: 'VoxApp répond à vos appels 24h/24 et 7j/7, prend automatiquement des rendez-vous et répond aux questions fréquentes. Plus jamais d\'appel manqué.', de: 'VoxApp beantwortet Ihre Anrufe rund um die Uhr, bucht automatisch Termine und beantwortet häufig gestellte Fragen. Nie wieder einen Anruf verpassen.' },
    tagline: { nl: 'Geen robotstemmen, maar uw eigen stem die spreekt.', en: 'No robot voices, but your own voice speaking.', fr: 'Pas de voix robotiques, mais votre propre voix qui parle.', de: 'Keine Roboterstimmen, sondern Ihre eigene Stimme.' },
    cta: { nl: 'Start gratis proefperiode', en: 'Start free trial', fr: 'Commencer l\'essai gratuit', de: 'Kostenlose Testphase starten' },
    tryDemo: { nl: 'Probeer demo', en: 'Try demo', fr: 'Essayer la démo', de: 'Demo testen' },
    kapper: { nl: 'Kapper', en: 'Hairdresser', fr: 'Coiffeur', de: 'Friseur' },
    frituur: { nl: 'Frituur', en: 'Snack bar', fr: 'Friterie', de: 'Imbiss' },
    stats: {
      calls: { nl: 'oproepen beantwoord', en: 'calls answered', fr: 'appels répondus', de: 'Anrufe beantwortet' },
      appointments: { nl: 'afspraken geboekt', en: 'appointments booked', fr: 'rendez-vous pris', de: 'Termine gebucht' },
      satisfaction: { nl: 'klanttevredenheid', en: 'customer satisfaction', fr: 'satisfaction client', de: 'Kundenzufriedenheit' },
    },
  },

  // Features Section
  features: {
    title: { nl: 'Alles wat u nodig heeft', en: 'Everything you need', fr: 'Tout ce dont vous avez besoin', de: 'Alles was Sie brauchen' },
    subtitle: { nl: 'VoxApp combineert slimme technologie met gebruiksgemak om uw telefonische klantenservice te transformeren.', en: 'VoxApp combines smart technology with ease of use to transform your phone customer service.', fr: 'VoxApp combine une technologie intelligente avec une facilité d\'utilisation pour transformer votre service client téléphonique.', de: 'VoxApp kombiniert intelligente Technologie mit Benutzerfreundlichkeit, um Ihren telefonischen Kundenservice zu transformieren.' },
    feature1: {
      title: { nl: '24/7 Bereikbaar', en: '24/7 Available', fr: 'Disponible 24h/24', de: '24/7 Erreichbar' },
      desc: { nl: 'Nooit meer een gemiste oproep. Uw receptionist is altijd beschikbaar, ook buiten kantooruren.', en: 'Never miss a call again. Your receptionist is always available, even outside office hours.', fr: 'Plus jamais d\'appel manqué. Votre réceptionniste est toujours disponible, même en dehors des heures de bureau.', de: 'Nie wieder einen Anruf verpassen. Ihr Rezeptionist ist immer erreichbar, auch außerhalb der Geschäftszeiten.' },
    },
    feature2: {
      title: { nl: 'Automatisch inboeken', en: 'Automatic booking', fr: 'Réservation automatique', de: 'Automatische Buchung' },
      desc: { nl: 'Afspraken worden direct in uw agenda geplaatst. Geen dubbele boekingen, geen gedoe.', en: 'Appointments are placed directly in your calendar. No double bookings, no hassle.', fr: 'Les rendez-vous sont placés directement dans votre agenda. Pas de double réservation, pas de tracas.', de: 'Termine werden direkt in Ihren Kalender eingetragen. Keine Doppelbuchungen, kein Ärger.' },
    },
    feature3: {
      title: { nl: 'SMS Bevestigingen', en: 'SMS Confirmations', fr: 'Confirmations SMS', de: 'SMS-Bestätigungen' },
      desc: { nl: 'Klanten ontvangen automatisch een SMS-bevestiging van hun afspraak.', en: 'Customers automatically receive an SMS confirmation of their appointment.', fr: 'Les clients reçoivent automatiquement une confirmation SMS de leur rendez-vous.', de: 'Kunden erhalten automatisch eine SMS-Bestätigung ihres Termins.' },
    },
    feature4: {
      title: { nl: 'Uw eigen stem', en: 'Your own voice', fr: 'Votre propre voix', de: 'Ihre eigene Stimme' },
      desc: { nl: 'Kloon uw stem of kies uit professionele stemmen. Uw klanten merken geen verschil.', en: 'Clone your voice or choose from professional voices. Your customers won\'t notice a difference.', fr: 'Clonez votre voix ou choisissez parmi des voix professionnelles. Vos clients ne verront pas la différence.', de: 'Klonen Sie Ihre Stimme oder wählen Sie aus professionellen Stimmen. Ihre Kunden merken keinen Unterschied.' },
    },
    feature5: {
      title: { nl: 'Slimme gesprekken', en: 'Smart conversations', fr: 'Conversations intelligentes', de: 'Intelligente Gespräche' },
      desc: { nl: 'Begrijpt context, beantwoordt vragen en handelt complexe verzoeken af.', en: 'Understands context, answers questions and handles complex requests.', fr: 'Comprend le contexte, répond aux questions et gère les demandes complexes.', de: 'Versteht Kontext, beantwortet Fragen und bearbeitet komplexe Anfragen.' },
    },
    feature6: {
      title: { nl: 'Dashboard & Analytics', en: 'Dashboard & Analytics', fr: 'Tableau de bord & Analyses', de: 'Dashboard & Analysen' },
      desc: { nl: 'Bekijk alle gesprekken, afspraken en statistieken in één overzichtelijk dashboard.', en: 'View all conversations, appointments and statistics in one clear dashboard.', fr: 'Consultez toutes les conversations, rendez-vous et statistiques dans un tableau de bord clair.', de: 'Sehen Sie alle Gespräche, Termine und Statistiken in einem übersichtlichen Dashboard.' },
    },
  },

  // How it works
  howItWorks: {
    title: { nl: 'Hoe het werkt', en: 'How it works', fr: 'Comment ça marche', de: 'So funktioniert es' },
    subtitle: { nl: 'In 4 simpele stappen naar uw eigen slimme receptionist', en: 'Your own smart receptionist in 4 simple steps', fr: 'Votre propre réceptionniste intelligent en 4 étapes simples', de: 'Ihr eigener smarter Rezeptionist in 4 einfachen Schritten' },
    step1: {
      title: { nl: 'Account aanmaken', en: 'Create account', fr: 'Créer un compte', de: 'Konto erstellen' },
      desc: { nl: 'Registreer in 2 minuten en kies uw sector.', en: 'Register in 2 minutes and choose your sector.', fr: 'Inscrivez-vous en 2 minutes et choisissez votre secteur.', de: 'Registrieren Sie sich in 2 Minuten und wählen Sie Ihre Branche.' },
    },
    step2: {
      title: { nl: 'Diensten toevoegen', en: 'Add services', fr: 'Ajouter des services', de: 'Dienste hinzufügen' },
      desc: { nl: 'Voeg uw diensten toe met prijzen en duur.', en: 'Add your services with prices and duration.', fr: 'Ajoutez vos services avec prix et durée.', de: 'Fügen Sie Ihre Dienstleistungen mit Preisen und Dauer hinzu.' },
    },
    step3: {
      title: { nl: 'Stem kiezen', en: 'Choose voice', fr: 'Choisir une voix', de: 'Stimme wählen' },
      desc: { nl: 'Kies een standaard stem of gebruik uw eigen stem. Klaar in 5 minuten.', en: 'Choose a standard voice or use your own voice. Ready in 5 minutes.', fr: 'Choisissez une voix standard ou utilisez votre propre voix. Prêt en 5 minutes.', de: 'Wählen Sie eine Standardstimme oder verwenden Sie Ihre eigene Stimme. In 5 Minuten fertig.' },
    },
    step4: {
      title: { nl: 'Live gaan', en: 'Go live', fr: 'Mettre en ligne', de: 'Live gehen' },
      desc: { nl: 'Koppel uw nummer en uw receptionist is klaar!', en: 'Connect your number and your receptionist is ready!', fr: 'Connectez votre numéro et votre réceptionniste est prêt!', de: 'Verbinden Sie Ihre Nummer und Ihr Rezeptionist ist bereit!' },
    },
  },

  // Demo Section
  demo: {
    title: { nl: 'Probeer het zelf', en: 'Try it yourself', fr: 'Essayez vous-même', de: 'Probieren Sie es selbst' },
    subtitle: { nl: 'Bel met onze demo en ervaar hoe VoxApp uw telefoon beantwoordt', en: 'Call our demo and experience how VoxApp answers your phone', fr: 'Appelez notre démo et découvrez comment VoxApp répond à votre téléphone', de: 'Rufen Sie unsere Demo an und erleben Sie, wie VoxApp Ihr Telefon beantwortet' },
    clickToOrder: { nl: 'Klik en bestel een demo bestelling bij Frituur De Schans', en: 'Click and place a demo order at Frituur De Schans', fr: 'Cliquez et passez une commande démo chez Frituur De Schans', de: 'Klicken Sie und bestellen Sie eine Demo-Bestellung bei Frituur De Schans' },
    kassaInfo: { nl: 'U kan de bestelling bevestigen of weigeren — de klant krijgt dan automatisch een SMS.', en: 'You can confirm or decline the order — the customer will automatically receive an SMS.', fr: 'Vous pouvez confirmer ou refuser la commande — le client recevra automatiquement un SMS.', de: 'Sie können die Bestellung bestätigen oder ablehnen — der Kunde erhält automatisch eine SMS.' },
  },

  // Pricing
  pricing: {
    title: { nl: 'Eenvoudige, transparante prijzen', en: 'Simple, transparent pricing', fr: 'Tarifs simples et transparents', de: 'Einfache, transparente Preise' },
    subtitle: { nl: 'Geen verborgen kosten. Geen lange contracten. 7 dagen gratis proberen.', en: 'No hidden costs. No long contracts. 7 days free trial.', fr: 'Pas de frais cachés. Pas de contrats longs. 7 jours d\'essai gratuit.', de: 'Keine versteckten Kosten. Keine langen Verträge. 7 Tage kostenlos testen.' },
    perMonth: { nl: '/maand', en: '/month', fr: '/mois', de: '/Monat' },
    popular: { nl: 'Populairst', en: 'Most popular', fr: 'Le plus populaire', de: 'Am beliebtesten' },
    startTrial: { nl: 'Start proefperiode', en: 'Start trial', fr: 'Commencer l\'essai', de: 'Testphase starten' },
    contactUs: { nl: 'Neem contact op', en: 'Contact us', fr: 'Contactez-nous', de: 'Kontaktieren Sie uns' },
    starter: {
      name: { nl: 'Starter', en: 'Starter', fr: 'Starter', de: 'Starter' },
      desc: { nl: 'Perfect voor zelfstandigen', en: 'Perfect for freelancers', fr: 'Parfait pour les indépendants', de: 'Perfekt für Selbstständige' },
      features: {
        f1: { nl: '300 minuten/maand', en: '300 minutes/month', fr: '300 minutes/mois', de: '300 Minuten/Monat' },
        f2: { nl: 'Receptionist 24/7', en: '24/7 Receptionist', fr: 'Réceptionniste 24h/24', de: 'Rezeptionist 24/7' },
        f3: { nl: '1 medewerker', en: '1 employee', fr: '1 employé', de: '1 Mitarbeiter' },
        f4: { nl: 'SMS bevestigingen', en: 'SMS confirmations', fr: 'Confirmations SMS', de: 'SMS-Bestätigungen' },
        f5: { nl: 'Email support', en: 'Email support', fr: 'Support par email', de: 'E-Mail-Support' },
      },
    },
    pro: {
      name: { nl: 'Pro', en: 'Pro', fr: 'Pro', de: 'Pro' },
      desc: { nl: 'Voor groeiende teams', en: 'For growing teams', fr: 'Pour les équipes en croissance', de: 'Für wachsende Teams' },
      features: {
        f1: { nl: '750 minuten/maand', en: '750 minutes/month', fr: '750 minutes/mois', de: '750 Minuten/Monat' },
        f2: { nl: 'Alles van Starter', en: 'Everything in Starter', fr: 'Tout de Starter', de: 'Alles von Starter' },
        f3: { nl: '5 medewerkers', en: '5 employees', fr: '5 employés', de: '5 Mitarbeiter' },
        f4: { nl: 'Voice cloning', en: 'Voice cloning', fr: 'Clonage de voix', de: 'Stimmklonen' },
        f5: { nl: 'Priority support', en: 'Priority support', fr: 'Support prioritaire', de: 'Prioritäts-Support' },
      },
    },
    business: {
      name: { nl: 'Business', en: 'Business', fr: 'Business', de: 'Business' },
      desc: { nl: 'Voor grotere bedrijven', en: 'For larger companies', fr: 'Pour les grandes entreprises', de: 'Für größere Unternehmen' },
      features: {
        f1: { nl: '1500 minuten/maand', en: '1500 minutes/month', fr: '1500 minutes/mois', de: '1500 Minuten/Monat' },
        f2: { nl: 'Alles van Pro', en: 'Everything in Pro', fr: 'Tout de Pro', de: 'Alles von Pro' },
        f3: { nl: 'Onbeperkt medewerkers', en: 'Unlimited employees', fr: 'Employés illimités', de: 'Unbegrenzte Mitarbeiter' },
        f4: { nl: 'API toegang', en: 'API access', fr: 'Accès API', de: 'API-Zugang' },
        f5: { nl: 'Dedicated manager', en: 'Dedicated manager', fr: 'Manager dédié', de: 'Dedizierter Manager' },
      },
    },
  },

  // Sectors
  sectors: {
    title: { nl: 'Voor elke sector', en: 'For every sector', fr: 'Pour chaque secteur', de: 'Für jeden Sektor' },
    subtitle: { nl: 'VoxApp past zich aan uw branche aan', en: 'VoxApp adapts to your industry', fr: 'VoxApp s\'adapte à votre secteur', de: 'VoxApp passt sich Ihrer Branche an' },
    hairdresser: { nl: 'Kappers', en: 'Hairdressers', fr: 'Coiffeurs', de: 'Friseure' },
    dentist: { nl: 'Tandartsen', en: 'Dentists', fr: 'Dentistes', de: 'Zahnärzte' },
    garage: { nl: 'Garages', en: 'Garages', fr: 'Garages', de: 'Werkstätten' },
    restaurant: { nl: 'Restaurants', en: 'Restaurants', fr: 'Restaurants', de: 'Restaurants' },
    doctor: { nl: 'Huisartsen', en: 'Doctors', fr: 'Médecins', de: 'Ärzte' },
    physio: { nl: 'Fysiotherapeuten', en: 'Physiotherapists', fr: 'Kinésithérapeutes', de: 'Physiotherapeuten' },
  },

  // FAQ
  faq: {
    title: { nl: 'Veelgestelde vragen', en: 'Frequently asked questions', fr: 'Questions fréquentes', de: 'Häufig gestellte Fragen' },
    q1: {
      q: { nl: 'Hoe natuurlijk klinkt de receptionist?', en: 'How natural does the receptionist sound?', fr: 'À quel point la réceptionniste semble-t-elle naturelle?', de: 'Wie natürlich klingt der Rezeptionist?' },
      a: { nl: 'Zeer natuurlijk! Klanten merken vaak niet dat ze met een slimme receptionist spreken. Met voice cloning klinkt het exact zoals u.', en: 'Very natural! Customers often don\'t notice they\'re speaking with a smart receptionist. With voice cloning, it sounds exactly like you.', fr: 'Très naturel! Les clients ne remarquent souvent pas qu\'ils parlent à un réceptionniste intelligent. Avec le clonage de voix, ça sonne exactement comme vous.', de: 'Sehr natürlich! Kunden merken oft nicht, dass sie mit einem smarten Rezeptionisten sprechen. Mit Stimmklonen klingt es genau wie Sie.' },
    },
    q2: {
      q: { nl: 'Kan ik de receptionist aanpassen?', en: 'Can I customize the receptionist?', fr: 'Puis-je personnaliser la réceptionniste?', de: 'Kann ich den Rezeptionisten anpassen?' },
      a: { nl: 'Ja! U bepaalt begroeting, diensten, openingsuren en hoe er gereageerd wordt.', en: 'Yes! You determine the greeting, services, opening hours and how to respond.', fr: 'Oui! Vous déterminez l\'accueil, les services, les heures d\'ouverture et comment répondre.', de: 'Ja! Sie bestimmen Begrüßung, Dienstleistungen, Öffnungszeiten und wie reagiert wird.' },
    },
    q3: {
      q: { nl: 'Werkt het met mijn bestaande nummer?', en: 'Does it work with my existing number?', fr: 'Ça fonctionne avec mon numéro existant?', de: 'Funktioniert es mit meiner bestehenden Nummer?' },
      a: { nl: 'Ja, via doorschakeling. Klanten bellen gewoon uw vertrouwde nummer.', en: 'Yes, via call forwarding. Customers simply call your trusted number.', fr: 'Oui, via le transfert d\'appel. Les clients appellent simplement votre numéro habituel.', de: 'Ja, über Rufumleitung. Kunden rufen einfach Ihre vertraute Nummer an.' },
    },
    q4: {
      q: { nl: 'Is er een proefperiode?', en: 'Is there a trial period?', fr: 'Y a-t-il une période d\'essai?', de: 'Gibt es eine Testphase?' },
      a: { nl: 'Ja, de eerste 7 dagen zijn volledig gratis. Geen creditcard nodig.', en: 'Yes, the first 7 days are completely free. No credit card required.', fr: 'Oui, les 7 premiers jours sont entièrement gratuits. Pas de carte de crédit requise.', de: 'Ja, die ersten 7 Tage sind völlig kostenlos. Keine Kreditkarte erforderlich.' },
    },
    q5: {
      q: { nl: 'Welke talen worden ondersteund?', en: 'Which languages are supported?', fr: 'Quelles langues sont supportées?', de: 'Welche Sprachen werden unterstützt?' },
      a: { nl: 'Nederlands, Frans, Engels en Duits - perfect voor België en internationale klanten!', en: 'Dutch, French, English and German - perfect for Belgium and international customers!', fr: 'Néerlandais, français, anglais et allemand - parfait pour la Belgique et les clients internationaux!', de: 'Niederländisch, Französisch, Englisch und Deutsch - perfekt für Belgien und internationale Kunden!' },
    },
  },

  // CTA Section
  cta: {
    title: { nl: 'Klaar om te starten?', en: 'Ready to start?', fr: 'Prêt à commencer?', de: 'Bereit zu starten?' },
    subtitle: { nl: 'Probeer VoxApp 7 dagen gratis. Geen creditcard nodig.', en: 'Try VoxApp free for 7 days. No credit card required.', fr: 'Essayez VoxApp gratuitement pendant 7 jours. Pas de carte de crédit requise.', de: 'Testen Sie VoxApp 7 Tage kostenlos. Keine Kreditkarte erforderlich.' },
    startTrial: { nl: 'Start gratis proefperiode', en: 'Start free trial', fr: 'Commencer l\'essai gratuit', de: 'Kostenlose Testphase starten' },
    talkToTeam: { nl: 'Praat met ons team', en: 'Talk to our team', fr: 'Parlez à notre équipe', de: 'Sprechen Sie mit unserem Team' },
  },

  // Contact Section
  contact: {
    title: { nl: 'Neem contact op', en: 'Get in touch', fr: 'Contactez-nous', de: 'Kontaktieren Sie uns' },
    subtitle: { nl: 'Heeft u vragen? Wij staan voor u klaar.', en: 'Have questions? We\'re here to help.', fr: 'Vous avez des questions? Nous sommes là pour vous aider.', de: 'Haben Sie Fragen? Wir sind für Sie da.' },
    email: { nl: 'E-mail', en: 'Email', fr: 'E-mail', de: 'E-Mail' },
    website: { nl: 'Website', en: 'Website', fr: 'Site web', de: 'Webseite' },
    location: { nl: 'Locatie', en: 'Location', fr: 'Emplacement', de: 'Standort' },
    liveSupport: { nl: 'Live Support', en: 'Live Support', fr: 'Support en direct', de: 'Live-Support' },
    liveSupportDesc: { nl: 'Praat direct met ons', en: 'Talk to us directly', fr: 'Parlez-nous directement', de: 'Sprechen Sie direkt mit uns' },
  },

  // Footer
  footer: {
    product: { nl: 'Product', en: 'Product', fr: 'Produit', de: 'Produkt' },
    company: { nl: 'Bedrijf', en: 'Company', fr: 'Entreprise', de: 'Unternehmen' },
    legal: { nl: 'Juridisch', en: 'Legal', fr: 'Légal', de: 'Rechtliches' },
    helpCenter: { nl: 'Help Center', en: 'Help Center', fr: 'Centre d\'aide', de: 'Hilfezentrum' },
    privacy: { nl: 'Privacy', en: 'Privacy', fr: 'Confidentialité', de: 'Datenschutz' },
    terms: { nl: 'Voorwaarden', en: 'Terms', fr: 'Conditions', de: 'Bedingungen' },
    allRights: { nl: 'Alle rechten voorbehouden.', en: 'All rights reserved.', fr: 'Tous droits réservés.', de: 'Alle Rechte vorbehalten.' },
  },

  // Cookie Banner
  cookies: {
    message: { nl: 'Wij gebruiken cookies om uw ervaring te verbeteren.', en: 'We use cookies to improve your experience.', fr: 'Nous utilisons des cookies pour améliorer votre expérience.', de: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.' },
    accept: { nl: 'Accepteren', en: 'Accept', fr: 'Accepter', de: 'Akzeptieren' },
    decline: { nl: 'Weigeren', en: 'Decline', fr: 'Refuser', de: 'Ablehnen' },
  },

  // Demo Modal
  demoModal: {
    title: { nl: 'Probeer de demo', en: 'Try the demo', fr: 'Essayez la démo', de: 'Probieren Sie die Demo' },
    connecting: { nl: 'Verbinden...', en: 'Connecting...', fr: 'Connexion...', de: 'Verbinden...' },
    connected: { nl: 'Verbonden', en: 'Connected', fr: 'Connecté', de: 'Verbunden' },
    speaking: { nl: 'Spreekt...', en: 'Speaking...', fr: 'Parle...', de: 'Spricht...' },
    listening: { nl: 'Luistert...', en: 'Listening...', fr: 'Écoute...', de: 'Hört zu...' },
    startCall: { nl: 'Start gesprek', en: 'Start call', fr: 'Démarrer l\'appel', de: 'Anruf starten' },
    endCall: { nl: 'Beëindig gesprek', en: 'End call', fr: 'Terminer l\'appel', de: 'Anruf beenden' },
    micPermission: { nl: 'Geef microfoon toegang om te starten', en: 'Allow microphone access to start', fr: 'Autorisez l\'accès au micro pour commencer', de: 'Erlauben Sie Mikrofonzugriff zum Starten' },
  },

  // About Us Page
  aboutUs: {
    heroTitle: { nl: 'Over', en: 'About', fr: 'À propos de', de: 'Über' },
    heroSubtitle: { nl: 'Vysion is een internationale technologie groep die wereldwijd innovatieve software oplossingen ontwikkelt voor bedrijven van elke omvang. VoxApp is een van onze toonaangevende producten.', en: 'Vysion is an international technology group that develops innovative software solutions worldwide for businesses of all sizes. VoxApp is one of our leading products.', fr: 'Vysion est un groupe technologique international qui développe des solutions logicielles innovantes dans le monde entier pour les entreprises de toutes tailles. VoxApp est l\'un de nos produits phares.', de: 'Vysion ist eine internationale Technologiegruppe, die weltweit innovative Softwarelösungen für Unternehmen jeder Größe entwickelt. VoxApp ist eines unserer führenden Produkte.' },
    badge: { nl: 'Internationale Tech Groep', en: 'International Tech Group', fr: 'Groupe Tech International', de: 'Internationale Tech-Gruppe' },
    founded: { nl: 'Opgericht', en: 'Founded', fr: 'Fondé', de: 'Gegründet' },
    customers: { nl: 'Tevreden klanten', en: 'Happy customers', fr: 'Clients satisfaits', de: 'Zufriedene Kunden' },
    languages: { nl: 'Talen ondersteund', en: 'Languages supported', fr: 'Langues supportées', de: 'Sprachen unterstützt' },
    support: { nl: 'Wereldwijde support', en: 'Worldwide support', fr: 'Support mondial', de: 'Weltweiter Support' },
    founderText: { nl: 'In 2013 richtte Rudi Aerden Vysion op met een duidelijke visie: technologie toegankelijk maken voor elk bedrijf, ongeacht grootte of budget. Wat begon als een klein softwarebedrijf in België is ondertussen uitgegroeid tot een bedrijf dat maatwerk software ontwikkelt voor KMO\'s, zelfstandigen en overheden.', en: 'In 2013, Rudi Aerden founded Vysion with a clear vision: making technology accessible to every business, regardless of size or budget. What started as a small software company in Belgium has now grown into a company that develops custom software for SMEs, freelancers and governments.', fr: 'En 2013, Rudi Aerden a fondé Vysion avec une vision claire: rendre la technologie accessible à chaque entreprise, quelle que soit sa taille ou son budget. Ce qui a commencé comme une petite entreprise de logiciels en Belgique est devenu une entreprise qui développe des logiciels sur mesure pour les PME, les indépendants et les gouvernements.', de: 'Im Jahr 2013 gründete Rudi Aerden Vysion mit einer klaren Vision: Technologie für jedes Unternehmen zugänglich zu machen, unabhängig von Größe oder Budget. Was als kleines Softwareunternehmen in Belgien begann, ist mittlerweile zu einem Unternehmen gewachsen, das maßgeschneiderte Software für KMU, Freiberufler und Behörden entwickelt.' },
    quote: { nl: 'Ons doel is simpel: bedrijven helpen groeien door slimme technologie. Met VoxApp brengen we die visie naar de telefoonlijn van elk bedrijf.', en: 'Our goal is simple: helping businesses grow through smart technology. With VoxApp, we bring that vision to every business\'s phone line.', fr: 'Notre objectif est simple: aider les entreprises à se développer grâce à une technologie intelligente. Avec VoxApp, nous apportons cette vision à la ligne téléphonique de chaque entreprise.', de: 'Unser Ziel ist einfach: Unternehmen durch intelligente Technologie beim Wachstum zu helfen. Mit VoxApp bringen wir diese Vision an die Telefonleitung jedes Unternehmens.' },
    whatWeDo: { nl: 'Wat wij doen', en: 'What we do', fr: 'Ce que nous faisons', de: 'Was wir tun' },
    whatWeDoSubtitle: { nl: 'Vysion ontwikkelt innovatieve software oplossingen die bedrijven helpen efficiënter te werken en sneller te groeien.', en: 'Vysion develops innovative software solutions that help businesses work more efficiently and grow faster.', fr: 'Vysion développe des solutions logicielles innovantes qui aident les entreprises à travailler plus efficacement et à se développer plus rapidement.', de: 'Vysion entwickelt innovative Softwarelösungen, die Unternehmen helfen, effizienter zu arbeiten und schneller zu wachsen.' },
    customSoftware: { nl: 'Maatwerk Software', en: 'Custom Software', fr: 'Logiciel sur mesure', de: 'Maßgeschneiderte Software' },
    customSoftwareDesc: { nl: 'Heeft u een uniek idee of specifieke bedrijfsbehoeften? Ons team ontwikkelt software volledig op maat, afgestemd op uw wensen en workflow.', en: 'Do you have a unique idea or specific business needs? Our team develops fully customized software, tailored to your wishes and workflow.', fr: 'Vous avez une idée unique ou des besoins commerciaux spécifiques? Notre équipe développe des logiciels entièrement personnalisés, adaptés à vos souhaits et à votre flux de travail.', de: 'Haben Sie eine einzigartige Idee oder spezifische Geschäftsanforderungen? Unser Team entwickelt vollständig maßgeschneiderte Software, die auf Ihre Wünsche und Ihren Workflow abgestimmt ist.' },
    internationalProjects: { nl: 'Internationale Projecten', en: 'International Projects', fr: 'Projets internationaux', de: 'Internationale Projekte' },
    internationalProjectsDesc: { nl: 'Met ondersteuning voor meer dan 20 talen en klanten wereldwijd, zijn wij uw partner voor internationale software projecten en uitbreidingen.', en: 'With support for more than 20 languages and customers worldwide, we are your partner for international software projects and expansions.', fr: 'Avec un support pour plus de 20 langues et des clients dans le monde entier, nous sommes votre partenaire pour les projets de logiciels internationaux et les expansions.', de: 'Mit Unterstützung für mehr als 20 Sprachen und Kunden weltweit sind wir Ihr Partner für internationale Softwareprojekte und Erweiterungen.' },
    customCTA: { nl: 'Software volledig op maat?', en: 'Fully custom software?', fr: 'Logiciel entièrement sur mesure?', de: 'Vollständig maßgeschneiderte Software?' },
    customCTADesc: { nl: 'Heeft u een specifiek idee of behoefte die niet door standaard software wordt opgelost? Ons ervaren team van ontwikkelaars bouwt software volledig op maat van uw bedrijf. Van mobiele apps tot complexe bedrijfssystemen — wij maken het mogelijk.', en: 'Do you have a specific idea or need that standard software doesn\'t solve? Our experienced team of developers builds software completely tailored to your business. From mobile apps to complex business systems — we make it possible.', fr: 'Vous avez une idée ou un besoin spécifique que les logiciels standard ne résolvent pas? Notre équipe expérimentée de développeurs crée des logiciels entièrement adaptés à votre entreprise. Des applications mobiles aux systèmes d\'entreprise complexes — nous le rendons possible.', de: 'Haben Sie eine spezifische Idee oder einen Bedarf, den Standardsoftware nicht löst? Unser erfahrenes Entwicklerteam erstellt Software, die vollständig auf Ihr Unternehmen zugeschnitten ist. Von mobilen Apps bis hin zu komplexen Geschäftssystemen — wir machen es möglich.' },
    requestCall: { nl: 'Vraag een gratis gesprek aan', en: 'Request a free consultation', fr: 'Demandez une consultation gratuite', de: 'Fordern Sie ein kostenloses Gespräch an' },
    globalPresence: { nl: 'Wereldwijd actief', en: 'Active worldwide', fr: 'Actif dans le monde entier', de: 'Weltweit aktiv' },
    globalPresenceDesc: { nl: 'Vanuit ons hoofdkantoor in België bedienen wij klanten over de hele wereld. Onze software draait in meer dan 20 talen en wordt dagelijks gebruikt door honderdduizenden gebruikers.', en: 'From our headquarters in Belgium, we serve customers around the world. Our software runs in more than 20 languages and is used daily by hundreds of thousands of users.', fr: 'Depuis notre siège en Belgique, nous servons des clients du monde entier. Notre logiciel fonctionne dans plus de 20 langues et est utilisé quotidiennement par des centaines de milliers d\'utilisateurs.', de: 'Von unserem Hauptsitz in Belgien aus bedienen wir Kunden auf der ganzen Welt. Unsere Software läuft in mehr als 20 Sprachen und wird täglich von Hunderttausenden von Benutzern verwendet.' },
    haveQuestions: { nl: 'Heeft u vragen of wilt u meer weten over onze diensten?', en: 'Do you have questions or would you like to know more about our services?', fr: 'Vous avez des questions ou souhaitez en savoir plus sur nos services?', de: 'Haben Sie Fragen oder möchten Sie mehr über unsere Dienstleistungen erfahren?' },
  },

  // Privacy Page
  privacy: {
    title: { nl: 'Privacybeleid', en: 'Privacy Policy', fr: 'Politique de confidentialité', de: 'Datenschutzrichtlinie' },
    lastUpdated: { nl: 'Laatst bijgewerkt: februari 2026', en: 'Last updated: February 2026', fr: 'Dernière mise à jour: février 2026', de: 'Zuletzt aktualisiert: Februar 2026' },
  },

  // Terms Page
  terms: {
    title: { nl: 'Algemene Voorwaarden', en: 'Terms and Conditions', fr: 'Conditions Générales', de: 'Allgemeine Geschäftsbedingungen' },
    lastUpdated: { nl: 'Laatst bijgewerkt: februari 2026', en: 'Last updated: February 2026', fr: 'Dernière mise à jour: février 2026', de: 'Zuletzt aktualisiert: Februar 2026' },
  },
};

// Helper function to get translation
export function t(key: string, lang: Language): string {
  const keys = key.split('.');
  let value: unknown = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  if (value && typeof value === 'object' && lang in value) {
    return (value as Record<Language, string>)[lang];
  }
  
  return key;
}
