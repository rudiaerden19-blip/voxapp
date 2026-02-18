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
    badge: { nl: 'Slimme Receptie voor Groeiende Bedrijven', en: 'Smart Reception for Growing Businesses', fr: 'Réception Intelligente pour Entreprises en Croissance', de: 'Smarte Rezeption für Wachsende Unternehmen' },
    title1: { nl: 'Mis nooit meer een afspraak.', en: 'Never miss an appointment again.', fr: 'Ne manquez plus jamais un rendez-vous.', de: 'Verpassen Sie nie wieder einen Termin.' },
    title2: { nl: 'Boek meer afspraken.', en: 'Book more appointments.', fr: 'Réservez plus de rendez-vous.', de: 'Buchen Sie mehr Termine.' },
    title3: { nl: 'Bespaar tijd.', en: 'Save time.', fr: 'Gagnez du temps.', de: 'Sparen Sie Zeit.' },
    subtitle: { nl: 'VoxApp beheert uw oproepen, boekt afspraken en beantwoordt vragen — zodat u kunt focussen op uw werk.', en: 'VoxApp manages your calls, books appointments and answers questions — so you can focus on your work.', fr: 'VoxApp gère vos appels, prend des rendez-vous et répond aux questions — pour que vous puissiez vous concentrer sur votre travail.', de: 'VoxApp verwaltet Ihre Anrufe, bucht Termine und beantwortet Fragen — damit Sie sich auf Ihre Arbeit konzentrieren können.' },
    tagline: { nl: 'Geen robotstemmen, maar uw eigen stem die spreekt.', en: 'No robot voices, but your own voice speaking.', fr: 'Pas de voix robotiques, mais votre propre voix qui parle.', de: 'Keine Roboterstimmen, sondern Ihre eigene Stimme.' },
    proof: { nl: 'Bewezen door klanten: 25% meer afspraken.', en: 'Proven by customers: 25% more appointments.', fr: 'Prouvé par les clients : 25 % de rendez-vous en plus.', de: 'Bewährt bei Kunden: 25 % mehr Termine.' },
    cta: { nl: 'Start gratis proefperiode', en: 'Start free trial', fr: 'Commencer l\'essai gratuit', de: 'Kostenlose Testphase starten' },
    tryDemo: { nl: 'Probeer demo', en: 'Try demo', fr: 'Essayer la démo', de: 'Demo testen' },
    kapper: { nl: 'Kapper', en: 'Hairdresser', fr: 'Coiffeur', de: 'Friseur' },
    frituur: { nl: 'Frituur', en: 'Snack bar', fr: 'Friterie', de: 'Imbiss' },
    receptionist: { nl: 'VoxApp Receptionist', en: 'VoxApp Receptionist', fr: 'Réceptionniste VoxApp', de: 'VoxApp Rezeptionist' },
    greeting: { nl: 'Goedemiddag, Kapsalon Belle. Waarmee kan ik u helpen?', en: 'Good afternoon, Salon Belle. How can I help you?', fr: 'Bonjour, Salon Belle. Comment puis-je vous aider?', de: 'Guten Tag, Salon Belle. Wie kann ich Ihnen helfen?' },
    receptionistAnswers: { nl: 'Receptionist Beantwoordt', en: 'Receptionist Answers', fr: 'Réceptionniste Répond', de: 'Rezeptionist Antwortet' },
    appointmentScheduled: { nl: 'Afspraak Ingepland', en: 'Appointment Scheduled', fr: 'Rendez-vous Planifié', de: 'Termin Geplant' },
    confirmationSent: { nl: 'Bevestiging Verstuurd', en: 'Confirmation Sent', fr: 'Confirmation Envoyée', de: 'Bestätigung Gesendet' },
    stats: {
      calls: { nl: 'oproepen beantwoord', en: 'calls answered', fr: 'appels répondus', de: 'Anrufe beantwortet' },
      appointments: { nl: 'afspraken geboekt', en: 'appointments booked', fr: 'rendez-vous pris', de: 'Termine gebucht' },
      satisfaction: { nl: 'klanttevredenheid', en: 'customer satisfaction', fr: 'satisfaction client', de: 'Kundenzufriedenheit' },
    },
    professionalReceptionist: { nl: 'Professionele receptionist', en: 'Professional receptionist', fr: 'Réceptionniste professionnelle', de: 'Professionelle Rezeptionistin' },
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
    badge: { nl: 'HOE HET WERKT', en: 'HOW IT WORKS', fr: 'COMMENT ÇA MARCHE', de: 'SO FUNKTIONIERT ES' },
    title1: { nl: 'Live in', en: 'Live in', fr: 'En ligne en', de: 'Live in' },
    title2: { nl: '10 minuten', en: '10 minutes', fr: '10 minutes', de: '10 Minuten' },
    subtitle: { nl: 'Geen technische kennis nodig. Onze wizard begeleidt u door elke stap.', en: 'No technical knowledge needed. Our wizard guides you through each step.', fr: 'Aucune connaissance technique requise. Notre assistant vous guide à chaque étape.', de: 'Keine technischen Kenntnisse erforderlich. Unser Assistent führt Sie durch jeden Schritt.' },
    step1: {
      title: { nl: 'Account aanmaken', en: 'Create account', fr: 'Créer un compte', de: 'Konto erstellen' },
      desc: { nl: 'Registreer in 2 minuten. Kies uw sector en vul bedrijfsgegevens in.', en: 'Register in 2 minutes. Choose your sector and fill in company details.', fr: 'Inscrivez-vous en 2 minutes. Choisissez votre secteur et remplissez les détails de l\'entreprise.', de: 'Registrieren Sie sich in 2 Minuten. Wählen Sie Ihre Branche und füllen Sie Firmendetails aus.' },
    },
    step2: {
      title: { nl: 'Diensten & medewerkers', en: 'Services & staff', fr: 'Services & personnel', de: 'Dienste & Mitarbeiter' },
      desc: { nl: 'Voeg diensten toe met prijzen. Configureer werkuren per medewerker.', en: 'Add services with prices. Configure working hours per employee.', fr: 'Ajoutez des services avec prix. Configurez les heures de travail par employé.', de: 'Fügen Sie Dienste mit Preisen hinzu. Konfigurieren Sie Arbeitszeiten pro Mitarbeiter.' },
    },
    step3: {
      title: { nl: 'Stem kiezen', en: 'Choose voice', fr: 'Choisir une voix', de: 'Stimme wählen' },
      desc: { nl: 'Kies een standaard stem of gebruik uw eigen stem. Klaar in 5 minuten.', en: 'Choose a standard voice or use your own voice. Ready in 5 minutes.', fr: 'Choisissez une voix standard ou utilisez votre propre voix. Prêt en 5 minutes.', de: 'Wählen Sie eine Standardstimme oder verwenden Sie Ihre eigene Stimme. In 5 Minuten fertig.' },
    },
    step4: {
      title: { nl: 'Ga live', en: 'Go live', fr: 'Passez en direct', de: 'Gehen Sie live' },
      desc: { nl: 'Koppel uw nummer en uw receptionist is actief. Klaar!', en: 'Connect your number and your receptionist is active. Done!', fr: 'Connectez votre numéro et votre réceptionniste est actif. Terminé!', de: 'Verbinden Sie Ihre Nummer und Ihr Rezeptionist ist aktiv. Fertig!' },
    },
    startNow: { nl: 'Start nu gratis', en: 'Start free now', fr: 'Commencez gratuitement', de: 'Jetzt kostenlos starten' },
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
    badge: { nl: 'PRIJZEN', en: 'PRICING', fr: 'TARIFS', de: 'PREISE' },
    title1: { nl: 'Simpele,', en: 'Simple,', fr: 'Tarifs', de: 'Einfache,' },
    title2: { nl: 'transparante prijzen', en: 'transparent pricing', fr: 'simples et transparents', de: 'transparente Preise' },
    subtitle: { nl: 'Alles inbegrepen. Geen verrassingen.', en: 'Everything included. No surprises.', fr: 'Tout compris. Pas de surprises.', de: 'Alles inklusive. Keine Überraschungen.' },
    perMonth: { nl: '/maand', en: '/month', fr: '/mois', de: '/Monat' },
    popular: { nl: 'Populair', en: 'Popular', fr: 'Populaire', de: 'Beliebt' },
    startTrial: { nl: 'Start 7 dagen gratis', en: 'Start 7 days free', fr: 'Commencer 7 jours gratuits', de: '7 Tage kostenlos starten' },
    minutes: { nl: 'min/maand', en: 'min/month', fr: 'min/mois', de: 'Min/Monat' },
    appointments: { nl: 'afspraken/maand', en: 'appointments/month', fr: 'rendez-vous/mois', de: 'Termine/Monat' },
    extraMinute: { nl: 'per extra minuut', en: 'per extra minute', fr: 'par minute supplémentaire', de: 'pro zusätzliche Minute' },
    monthlyCancelable: { nl: 'Maandelijks opzegbaar', en: 'Cancel monthly', fr: 'Résiliable mensuellement', de: 'Monatlich kündbar' },
    starter: {
      name: { nl: 'Starter', en: 'Starter', fr: 'Starter', de: 'Starter' },
      desc: { nl: 'Perfect voor zelfstandigen.', en: 'Perfect for freelancers.', fr: 'Parfait pour les indépendants.', de: 'Perfekt für Selbstständige.' },
      f1: { nl: 'Receptionist 24/7', en: '24/7 Receptionist', fr: 'Réceptionniste 24h/24', de: 'Rezeptionist 24/7' },
      f2: { nl: 'Ingebouwde agenda', en: 'Built-in calendar', fr: 'Agenda intégré', de: 'Integrierter Kalender' },
      f3: { nl: '1 medewerker', en: '1 employee', fr: '1 employé', de: '1 Mitarbeiter' },
      f4: { nl: 'SMS bevestigingen', en: 'SMS confirmations', fr: 'Confirmations SMS', de: 'SMS-Bestätigungen' },
      f5: { nl: 'Gesprekstranscripties', en: 'Call transcripts', fr: 'Transcriptions d\'appels', de: 'Gesprächstranskripte' },
      f6: { nl: 'Email support', en: 'Email support', fr: 'Support par email', de: 'E-Mail-Support' },
    },
    pro: {
      name: { nl: 'Pro', en: 'Pro', fr: 'Pro', de: 'Pro' },
      desc: { nl: 'Voor groeiende teams.', en: 'For growing teams.', fr: 'Pour les équipes en croissance.', de: 'Für wachsende Teams.' },
      f1: { nl: 'Alles van Starter, plus:', en: 'Everything in Starter, plus:', fr: 'Tout de Starter, plus:', de: 'Alles von Starter, plus:' },
      f2: { nl: '5 medewerkers', en: '5 employees', fr: '5 employés', de: '5 Mitarbeiter' },
      f3: { nl: 'Voice cloning', en: 'Voice cloning', fr: 'Clonage de voix', de: 'Stimmklonen' },
      f4: { nl: 'Uitgaande herinneringen', en: 'Outbound reminders', fr: 'Rappels sortants', de: 'Ausgehende Erinnerungen' },
      f5: { nl: 'Online booking pagina', en: 'Online booking page', fr: 'Page de réservation en ligne', de: 'Online-Buchungsseite' },
      f6: { nl: 'Priority support', en: 'Priority support', fr: 'Support prioritaire', de: 'Prioritäts-Support' },
    },
    business: {
      name: { nl: 'Business', en: 'Business', fr: 'Business', de: 'Business' },
      desc: { nl: 'Voor grotere bedrijven.', en: 'For larger companies.', fr: 'Pour les grandes entreprises.', de: 'Für größere Unternehmen.' },
      f1: { nl: 'Alles van Pro, plus:', en: 'Everything in Pro, plus:', fr: 'Tout de Pro, plus:', de: 'Alles von Pro, plus:' },
      f2: { nl: 'Onbeperkt medewerkers', en: 'Unlimited employees', fr: 'Employés illimités', de: 'Unbegrenzte Mitarbeiter' },
      f3: { nl: 'Meerdere locaties', en: 'Multiple locations', fr: 'Plusieurs emplacements', de: 'Mehrere Standorte' },
      f4: { nl: 'API toegang', en: 'API access', fr: 'Accès API', de: 'API-Zugang' },
      f5: { nl: 'Custom integraties', en: 'Custom integrations', fr: 'Intégrations personnalisées', de: 'Benutzerdefinierte Integrationen' },
      f6: { nl: 'Account manager', en: 'Account manager', fr: 'Gestionnaire de compte', de: 'Account Manager' },
    },
  },

  // Sectors / For Who Section
  forWho: {
    badge: { nl: 'Voor Wie', en: 'For Whom', fr: 'Pour Qui', de: 'Für Wen' },
    title1: { nl: 'Perfect voor', en: 'Perfect for', fr: 'Parfait pour', de: 'Perfekt für' },
    title2: { nl: 'elk bedrijf', en: 'every business', fr: 'chaque entreprise', de: 'jedes Unternehmen' },
    subtitle: { nl: 'VoxApp past zich aan elk type onderneming aan', en: 'VoxApp adapts to every type of business', fr: 'VoxApp s\'adapte à tout type d\'entreprise', de: 'VoxApp passt sich jedem Unternehmenstyp an' },
    businesses: {
      kapsalons: { nl: 'Kapsalons', en: 'Hair Salons', fr: 'Salons de coiffure', de: 'Friseursalons' },
      dokterspraktijken: { nl: 'Dokterspraktijken', en: 'Doctor\'s Offices', fr: 'Cabinets médicaux', de: 'Arztpraxen' },
      ziekenhuizen: { nl: 'Ziekenhuizen', en: 'Hospitals', fr: 'Hôpitaux', de: 'Krankenhäuser' },
      hotels: { nl: 'Hotels', en: 'Hotels', fr: 'Hôtels', de: 'Hotels' },
      frituren: { nl: 'Frituren', en: 'Snack Bars', fr: 'Friteries', de: 'Imbissbuden' },
      kebabzaken: { nl: 'Kebabzaken', en: 'Kebab Shops', fr: 'Kebabs', de: 'Kebab-Läden' },
      pizzerias: { nl: 'Pizzeria\'s', en: 'Pizzerias', fr: 'Pizzerias', de: 'Pizzerien' },
      restaurants: { nl: 'Restaurants', en: 'Restaurants', fr: 'Restaurants', de: 'Restaurants' },
      tandartsen: { nl: 'Tandartsen', en: 'Dentists', fr: 'Dentistes', de: 'Zahnärzte' },
      opticiens: { nl: 'Opticiens', en: 'Opticians', fr: 'Opticiens', de: 'Optiker' },
      beautysalons: { nl: 'Beautysalons', en: 'Beauty Salons', fr: 'Salons de beauté', de: 'Schönheitssalons' },
      fitnessstudios: { nl: 'Fitnessstudio\'s', en: 'Fitness Studios', fr: 'Salles de sport', de: 'Fitnessstudios' },
      garages: { nl: 'Garages', en: 'Garages', fr: 'Garages', de: 'Werkstätten' },
      immobilienkantoren: { nl: 'Immobiliënkantoren', en: 'Real Estate Offices', fr: 'Agences immobilières', de: 'Immobilienbüros' },
      advocatenkantoren: { nl: 'Advocatenkantoren', en: 'Law Firms', fr: 'Cabinets d\'avocats', de: 'Anwaltskanzleien' },
      boekhoudkantoren: { nl: 'Boekhoudkantoren', en: 'Accounting Firms', fr: 'Cabinets comptables', de: 'Buchhaltungsbüros' },
      dierenklinieken: { nl: 'Dierenklinieken', en: 'Veterinary Clinics', fr: 'Cliniques vétérinaires', de: 'Tierkliniken' },
      bloemenwinkels: { nl: 'Bloemenwinkels', en: 'Flower Shops', fr: 'Fleuristes', de: 'Blumenläden' },
      schoonmaakbedrijven: { nl: 'Schoonmaakbedrijven', en: 'Cleaning Companies', fr: 'Entreprises de nettoyage', de: 'Reinigungsfirmen' },
      loodgieters: { nl: 'Loodgieters', en: 'Plumbers', fr: 'Plombiers', de: 'Klempner' },
      bedrijven: { nl: 'Bedrijven', en: 'Companies', fr: 'Entreprises', de: 'Unternehmen' },
      brandweer: { nl: 'Brandweer', en: 'Fire Department', fr: 'Pompiers', de: 'Feuerwehr' },
      politie: { nl: 'Politie', en: 'Police', fr: 'Police', de: 'Polizei' },
    },
  },

  // Inbound Section
  inbound: {
    badge: { nl: 'Inkomende Oproepen', en: 'Incoming Calls', fr: 'Appels Entrants', de: 'Eingehende Anrufe' },
    title: { nl: 'Lever de snelle, persoonlijke antwoorden die klanten verwachten.', en: 'Deliver the fast, personal answers customers expect.', fr: 'Offrez les réponses rapides et personnelles que les clients attendent.', de: 'Liefern Sie die schnellen, persönlichen Antworten, die Kunden erwarten.' },
    subtitle: { nl: 'Elke oproep wordt snel en natuurlijk beantwoord. Klanten krijgen direct antwoord, makkelijke boekingen, en een vriendelijke ervaring die past bij uw merk.', en: 'Every call is answered quickly and naturally. Customers get immediate answers, easy bookings, and a friendly experience that fits your brand.', fr: 'Chaque appel est répondu rapidement et naturellement. Les clients obtiennent des réponses immédiates, des réservations faciles et une expérience conviviale qui correspond à votre marque.', de: 'Jeder Anruf wird schnell und natürlich beantwortet. Kunden erhalten sofortige Antworten, einfache Buchungen und ein freundliches Erlebnis, das zu Ihrer Marke passt.' },
    startFree: { nl: 'Start gratis', en: 'Start free', fr: 'Commencer gratuitement', de: 'Kostenlos starten' },
    listenDemo: { nl: 'Luister Demo Gesprek', en: 'Listen to Demo Call', fr: 'Écouter Démo Appel', de: 'Demo-Anruf anhören' },
    feature1: { nl: 'Beantwoord klantvragen', en: 'Answer customer questions', fr: 'Répondre aux questions clients', de: 'Kundenfragen beantworten' },
    feature2: { nl: 'Beheer afspraakwijzigingen', en: 'Manage appointment changes', fr: 'Gérer les modifications de rendez-vous', de: 'Terminänderungen verwalten' },
    feature3: { nl: 'Route prioriteitsoproepen', en: 'Route priority calls', fr: 'Router les appels prioritaires', de: 'Prioritätsanrufe weiterleiten' },
    feature4: { nl: 'Vang nieuwe leads', en: 'Capture new leads', fr: 'Capturer de nouveaux prospects', de: 'Neue Leads erfassen' },
    garageWorkshop: { nl: 'Garage werkplaats', en: 'Garage workshop', fr: 'Atelier garage', de: 'Werkstatt' },
  },

  // Restaurant Section
  restaurant: {
    badge: { nl: 'Restaurant Reserveringen', en: 'Restaurant Reservations', fr: 'Réservations Restaurant', de: 'Restaurant-Reservierungen' },
    title: { nl: 'Mis nooit meer een reservering.', en: 'Never miss a reservation again.', fr: 'Plus jamais de réservation manquée.', de: 'Nie wieder eine verpasste Reservierung.' },
    subtitle: { nl: 'Uw receptionist neemt reserveringen aan, bevestigt beschikbaarheid en stuurt automatisch bevestigingen — ook buiten de openingsuren.', en: 'Your receptionist takes reservations, confirms availability and sends automatic confirmations — even outside opening hours.', fr: 'Votre réceptionniste prend les réservations, confirme la disponibilité et envoie des confirmations automatiques — même en dehors des heures d\'ouverture.', de: 'Ihr Rezeptionist nimmt Reservierungen entgegen, bestätigt Verfügbarkeit und sendet automatische Bestätigungen — auch außerhalb der Öffnungszeiten.' },
    tryDemo: { nl: 'Probeer Restaurant Demo', en: 'Try Restaurant Demo', fr: 'Essayer Démo Restaurant', de: 'Restaurant-Demo testen' },
    feature1: { nl: 'Neem reserveringen aan 24/7', en: 'Take reservations 24/7', fr: 'Prendre des réservations 24h/24', de: 'Reservierungen 24/7 annehmen' },
    feature2: { nl: 'Check beschikbaarheid realtime', en: 'Check availability in real-time', fr: 'Vérifier la disponibilité en temps réel', de: 'Verfügbarkeit in Echtzeit prüfen' },
    feature3: { nl: 'Stuur automatische bevestigingen', en: 'Send automatic confirmations', fr: 'Envoyer des confirmations automatiques', de: 'Automatische Bestätigungen senden' },
    feature4: { nl: 'Beheer groepsreserveringen', en: 'Manage group reservations', fr: 'Gérer les réservations de groupe', de: 'Gruppenreservierungen verwalten' },
    restaurantInterior: { nl: 'Restaurant interieur', en: 'Restaurant interior', fr: 'Intérieur restaurant', de: 'Restaurantinterieur' },
  },

  // Frituur Section  
  frituur: {
    badge: { nl: 'Frituren & Afhaalzaken', en: 'Snack Bars & Takeaway', fr: 'Friteries & À emporter', de: 'Imbisse & Takeaway' },
    title: { nl: 'Bestellingen opnemen via spraak.', en: 'Take orders via voice.', fr: 'Prendre des commandes par la voix.', de: 'Bestellungen per Sprache aufnehmen.' },
    subtitle: { nl: 'Klanten bellen of spreken hun bestelling in. De receptie noteert alles correct, berekent de prijs en geeft een afhaaltijd — zonder wachtrij.', en: 'Customers call or speak their order. The receptionist notes everything correctly, calculates the price and gives a pickup time — without queuing.', fr: 'Les clients appellent ou dictent leur commande. La réception note tout correctement, calcule le prix et donne une heure de retrait — sans file d\'attente.', de: 'Kunden rufen an oder sprechen ihre Bestellung ein. Die Rezeption notiert alles korrekt, berechnet den Preis und gibt eine Abholzeit — ohne Warteschlange.' },
    clickToOrder: { nl: 'Klik en bestel een demo bestelling bij Frituur De Schans', en: 'Click and place a demo order at Frituur De Schans', fr: 'Cliquez et passez une commande démo chez Frituur De Schans', de: 'Klicken und Demo-Bestellung bei Frituur De Schans aufgeben' },
    smsInfo: { nl: 'U kan de bestelling bevestigen of weigeren — de klant krijgt dan automatisch een SMS.', en: 'You can confirm or decline the order — the customer automatically receives an SMS.', fr: 'Vous pouvez confirmer ou refuser la commande — le client reçoit automatiquement un SMS.', de: 'Sie können die Bestellung bestätigen oder ablehnen — der Kunde erhält automatisch eine SMS.' },
    feature1: { nl: 'Neemt bestellingen aan via telefoon', en: 'Takes orders via phone', fr: 'Prend les commandes par téléphone', de: 'Nimmt Bestellungen per Telefon an' },
    feature2: { nl: 'Berekent automatisch afhaaltijd', en: 'Automatically calculates pickup time', fr: 'Calcule automatiquement l\'heure de retrait', de: 'Berechnet automatisch Abholzeit' },
    feature3: { nl: 'Bevestigt bestelling + totaalprijs', en: 'Confirms order + total price', fr: 'Confirme la commande + prix total', de: 'Bestätigt Bestellung + Gesamtpreis' },
    feature4: { nl: 'SMS bevestiging naar klant', en: 'SMS confirmation to customer', fr: 'Confirmation SMS au client', de: 'SMS-Bestätigung an Kunden' },
    frituurImage: { nl: 'Frituur met verse friet', en: 'Snack bar with fresh fries', fr: 'Friterie avec frites fraîches', de: 'Imbiss mit frischen Pommes' },
    connecting: { nl: 'Verbinden met Frituur De Schans...', en: 'Connecting to Frituur De Schans...', fr: 'Connexion à Frituur De Schans...', de: 'Verbinden mit Frituur De Schans...' },
    staffSpeaking: { nl: 'Medewerker spreekt...', en: 'Staff speaking...', fr: 'L\'employé parle...', de: 'Mitarbeiter spricht...' },
    speakOrder: { nl: 'Spreek uw bestelling in...', en: 'Speak your order...', fr: 'Dictez votre commande...', de: 'Sprechen Sie Ihre Bestellung...' },
    errorMessage: { nl: 'Er ging iets mis. Probeer het opnieuw.', en: 'Something went wrong. Please try again.', fr: 'Une erreur s\'est produite. Veuillez réessayer.', de: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.' },
    micError: { nl: 'Kon geen verbinding maken. Controleer je microfoon.', en: 'Could not connect. Check your microphone.', fr: 'Impossible de se connecter. Vérifiez votre microphone.', de: 'Verbindung fehlgeschlagen. Überprüfen Sie Ihr Mikrofon.' },
  },

  // Appointments Section
  appointments: {
    badge: { nl: 'Afspraken Boeken', en: 'Book Appointments', fr: 'Prendre des rendez-vous', de: 'Termine buchen' },
    title1: { nl: 'Automatisch', en: 'Automatically', fr: 'Automatiquement', de: 'Automatisch' },
    title2: { nl: 'afspraken inplannen', en: 'schedule appointments', fr: 'planifier des rendez-vous', de: 'Termine planen' },
    subtitle: { nl: 'Klanten kunnen direct een afspraak maken. VoxApp controleert uw agenda, vindt een geschikt moment en bevestigt de afspraak.', en: 'Customers can book an appointment directly. VoxApp checks your calendar, finds a suitable time and confirms the appointment.', fr: 'Les clients peuvent prendre rendez-vous directement. VoxApp vérifie votre agenda, trouve un moment approprié et confirme le rendez-vous.', de: 'Kunden können direkt einen Termin buchen. VoxApp prüft Ihren Kalender, findet einen passenden Zeitpunkt und bestätigt den Termin.' },
    feature1: { nl: 'Agenda-integratie', en: 'Calendar integration', fr: 'Intégration calendrier', de: 'Kalenderintegration' },
    feature2: { nl: 'Automatische bevestiging', en: 'Automatic confirmation', fr: 'Confirmation automatique', de: 'Automatische Bestätigung' },
    feature3: { nl: 'Herinnering SMS', en: 'Reminder SMS', fr: 'SMS de rappel', de: 'Erinnerungs-SMS' },
    bookAppointment: { nl: 'Ik wil een afspraak maken', en: 'I want to make an appointment', fr: 'Je voudrais prendre rendez-vous', de: 'Ich möchte einen Termin machen' },
    checkingAvailability: { nl: 'Even kijken... Woensdag om 14:00 is beschikbaar. Past dat?', en: 'Let me check... Wednesday at 2 PM is available. Does that work?', fr: 'Laissez-moi vérifier... Mercredi à 14h est disponible. Cela vous convient?', de: 'Moment... Mittwoch um 14 Uhr ist verfügbar. Passt das?' },
    perfect: { nl: 'Perfect, dat past!', en: 'Perfect, that works!', fr: 'Parfait, ça me va!', de: 'Perfekt, das passt!' },
    confirmed: { nl: 'Uw afspraak is bevestigd. U ontvangt een SMS-bevestiging.', en: 'Your appointment is confirmed. You will receive an SMS confirmation.', fr: 'Votre rendez-vous est confirmé. Vous recevrez une confirmation par SMS.', de: 'Ihr Termin ist bestätigt. Sie erhalten eine SMS-Bestätigung.' },
    // Dashboard appointments
    title: { nl: 'Afspraken', en: 'Appointments', fr: 'Rendez-vous', de: 'Termine' },
    pageSubtitle: { nl: 'Bekijk en beheer alle afspraken.', en: 'View and manage all appointments.', fr: 'Consultez et gérez tous les rendez-vous.', de: 'Sehen und verwalten Sie alle Termine.' },
    noAppointments: { nl: 'Geen afspraken gevonden', en: 'No appointments found', fr: 'Aucun rendez-vous trouvé', de: 'Keine Termine gefunden' },
    customer: { nl: 'Klant', en: 'Customer', fr: 'Client', de: 'Kunde' },
    service: { nl: 'Dienst', en: 'Service', fr: 'Service', de: 'Dienst' },
    date: { nl: 'Datum', en: 'Date', fr: 'Date', de: 'Datum' },
    time: { nl: 'Tijd', en: 'Time', fr: 'Heure', de: 'Zeit' },
    status: { nl: 'Status', en: 'Status', fr: 'Statut', de: 'Status' },
  },

  // Kassa Section
  kassa: {
    badge: { nl: 'Automatisch Verwerkt', en: 'Automatically Processed', fr: 'Traitement Automatique', de: 'Automatisch Verarbeitet' },
    title1: { nl: 'De klant belt in, u werkt gewoon verder.', en: 'The customer calls, you keep working.', fr: 'Le client appelle, vous continuez à travailler.', de: 'Der Kunde ruft an, Sie arbeiten einfach weiter.' },
    title2: { nl: 'De bestelling komt automatisch binnen.', en: 'The order comes in automatically.', fr: 'La commande arrive automatiquement.', de: 'Die Bestellung kommt automatisch rein.' },
    subtitle: { nl: 'Terwijl u friet bakt, verschijnt de bestelling op uw kassascherm én komt de bon uit de printer. Geen telefoon oppakken, geen fouten.', en: 'While you make fries, the order appears on your POS screen and the receipt prints. No picking up the phone, no mistakes.', fr: 'Pendant que vous faites des frites, la commande apparaît sur votre écran de caisse et le reçu s\'imprime. Pas besoin de décrocher, pas d\'erreurs.', de: 'Während Sie Pommes machen, erscheint die Bestellung auf Ihrem Kassenbildschirm und der Bon wird gedruckt. Kein Telefon abnehmen, keine Fehler.' },
    smsInfo: { nl: 'U kan de bestelling bevestigen of weigeren — de klant krijgt dan automatisch een SMS.', en: 'You can confirm or decline the order — the customer automatically receives an SMS.', fr: 'Vous pouvez confirmer ou refuser la commande — le client reçoit automatiquement un SMS.', de: 'Sie können die Bestellung bestätigen oder ablehnen — der Kunde erhält automatisch eine SMS.' },
    newOrder: { nl: 'NIEUWE BESTELLING!', en: 'NEW ORDER!', fr: 'NOUVELLE COMMANDE!', de: 'NEUE BESTELLUNG!' },
    customer: { nl: 'Klant', en: 'Customer', fr: 'Client', de: 'Kunde' },
    order: { nl: 'Bestelling', en: 'Order', fr: 'Commande', de: 'Bestellung' },
    deliver: { nl: 'LEVEREN', en: 'DELIVER', fr: 'LIVRER', de: 'LIEFERN' },
    at: { nl: 'om', en: 'at', fr: 'à', de: 'um' },
    total: { nl: 'TOTAAL', en: 'TOTAL', fr: 'TOTAL', de: 'GESAMT' },
    bonPrinter: { nl: 'Bon Printer', en: 'Receipt Printer', fr: 'Imprimante de reçus', de: 'Bondrucker' },
    orderNr: { nl: 'Bestelling #', en: 'Order #', fr: 'Commande #', de: 'Bestellung #' },
    date: { nl: 'Datum', en: 'Date', fr: 'Date', de: 'Datum' },
    time: { nl: 'Tijd', en: 'Time', fr: 'Heure', de: 'Zeit' },
    deliveryTime: { nl: 'Levering', en: 'Delivery', fr: 'Livraison', de: 'Lieferung' },
    address: { nl: 'Adres', en: 'Address', fr: 'Adresse', de: 'Adresse' },
    thankYou: { nl: 'Bedankt voor uw bestelling!', en: 'Thank you for your order!', fr: 'Merci pour votre commande!', de: 'Vielen Dank für Ihre Bestellung!' },
    kassa: { nl: 'KASSA', en: 'POS', fr: 'CAISSE', de: 'KASSE' },
  },

  // FAQ
  faq: {
    badge: { nl: 'FAQ', en: 'FAQ', fr: 'FAQ', de: 'FAQ' },
    title1: { nl: 'Veelgestelde', en: 'Frequently asked', fr: 'Questions', de: 'Häufig gestellte' },
    title2: { nl: 'vragen', en: 'questions', fr: 'fréquentes', de: 'Fragen' },
    q1: {
      q: { nl: 'Hoe snel kan ik starten?', en: 'How fast can I start?', fr: 'À quelle vitesse puis-je commencer?', de: 'Wie schnell kann ich starten?' },
      a: { nl: 'Binnen 10 minuten. Onze setup wizard begeleidt u stap voor stap.', en: 'Within 10 minutes. Our setup wizard guides you step by step.', fr: 'En 10 minutes. Notre assistant de configuration vous guide étape par étape.', de: 'Innerhalb von 10 Minuten. Unser Setup-Assistent führt Sie Schritt für Schritt.' },
    },
    q2: {
      q: { nl: 'Kan ik mijn bestaande nummer behouden?', en: 'Can I keep my existing number?', fr: 'Puis-je garder mon numéro existant?', de: 'Kann ich meine bestehende Nummer behalten?' },
      a: { nl: 'Ja! U kunt uw bestaande nummer doorschakelen naar VoxApp.', en: 'Yes! You can forward your existing number to VoxApp.', fr: 'Oui! Vous pouvez transférer votre numéro existant vers VoxApp.', de: 'Ja! Sie können Ihre bestehende Nummer zu VoxApp weiterleiten.' },
    },
    q3: {
      q: { nl: 'Hoe werkt de voice cloning?', en: 'How does voice cloning work?', fr: 'Comment fonctionne le clonage de voix?', de: 'Wie funktioniert das Stimmklonen?' },
      a: { nl: 'U leest 5 minuten een tekst in. VoxApp klinkt daarna precies als u.', en: 'You read a text for 5 minutes. VoxApp then sounds exactly like you.', fr: 'Vous lisez un texte pendant 5 minutes. VoxApp sonne ensuite exactement comme vous.', de: 'Sie lesen 5 Minuten einen Text. VoxApp klingt danach genau wie Sie.' },
    },
    q4: {
      q: { nl: 'Welke talen worden ondersteund?', en: 'Which languages are supported?', fr: 'Quelles langues sont supportées?', de: 'Welche Sprachen werden unterstützt?' },
      a: { nl: 'Nederlands, Frans en Duits. Automatische taalherkenning.', en: 'Dutch, French and German. Automatic language detection.', fr: 'Néerlandais, français et allemand. Détection automatique de la langue.', de: 'Niederländisch, Französisch und Deutsch. Automatische Spracherkennung.' },
    },
    q5: {
      q: { nl: 'Is er een contract?', en: 'Is there a contract?', fr: 'Y a-t-il un contrat?', de: 'Gibt es einen Vertrag?' },
      a: { nl: 'Nee. Maandelijks opzegbaar, 7 dagen gratis.', en: 'No. Cancel monthly, 7 days free.', fr: 'Non. Résiliation mensuelle, 7 jours gratuits.', de: 'Nein. Monatlich kündbar, 7 Tage kostenlos.' },
    },
  },

  // CTA Section
  cta: {
    title1: { nl: 'Klaar om nooit meer een', en: 'Ready to never miss a', fr: 'Prêt à ne plus jamais manquer un', de: 'Bereit, nie wieder einen' },
    title2: { nl: 'oproep te missen?', en: 'call again?', fr: 'appel?', de: 'Anruf zu verpassen?' },
    subtitle: { nl: 'Start vandaag nog. 7 dagen gratis, geen contract.', en: 'Start today. 7 days free, no contract.', fr: 'Commencez aujourd\'hui. 7 jours gratuits, sans contrat.', de: 'Starten Sie heute. 7 Tage kostenlos, kein Vertrag.' },
    startTrial: { nl: 'Start gratis proefperiode', en: 'Start free trial', fr: 'Commencer l\'essai gratuit', de: 'Kostenlose Testphase starten' },
    talkToTeam: { nl: 'Praat met ons team', en: 'Talk to our team', fr: 'Parlez à notre équipe', de: 'Sprechen Sie mit unserem Team' },
    support: { nl: 'VoxApp Support', en: 'VoxApp Support', fr: 'Support VoxApp', de: 'VoxApp Support' },
    askQuestions: { nl: 'Stel al uw vragen over VoxApp', en: 'Ask all your questions about VoxApp', fr: 'Posez toutes vos questions sur VoxApp', de: 'Stellen Sie alle Ihre Fragen zu VoxApp' },
    connecting: { nl: 'Verbinden...', en: 'Connecting...', fr: 'Connexion...', de: 'Verbinden...' },
    speaking: { nl: 'Aan het spreken...', en: 'Speaking...', fr: 'En train de parler...', de: 'Spricht...' },
    listening: { nl: 'Luistert naar u...', en: 'Listening to you...', fr: 'Vous écoute...', de: 'Hört Ihnen zu...' },
    error: { nl: 'Er ging iets mis. Probeer opnieuw.', en: 'Something went wrong. Try again.', fr: 'Une erreur s\'est produite. Réessayez.', de: 'Etwas ist schiefgelaufen. Versuchen Sie es erneut.' },
    startCall: { nl: 'Start gesprek', en: 'Start call', fr: 'Démarrer l\'appel', de: 'Anruf starten' },
    endCall: { nl: 'Beëindig gesprek', en: 'End call', fr: 'Terminer l\'appel', de: 'Anruf beenden' },
  },

  // Contact Section
  contact: {
    title: { nl: 'Contact', en: 'Contact', fr: 'Contact', de: 'Kontakt' },
    subtitle: { nl: 'Heeft u vragen over VoxApp? Wij helpen u graag verder.', en: 'Have questions about VoxApp? We\'re happy to help.', fr: 'Vous avez des questions sur VoxApp? Nous sommes là pour vous aider.', de: 'Haben Sie Fragen zu VoxApp? Wir helfen Ihnen gerne weiter.' },
    email: { nl: 'E-mail', en: 'Email', fr: 'E-mail', de: 'E-Mail' },
    website: { nl: 'Website', en: 'Website', fr: 'Site web', de: 'Webseite' },
    location: { nl: 'Locatie', en: 'Location', fr: 'Emplacement', de: 'Standort' },
    liveSupport: { nl: 'Live Support', en: 'Live Support', fr: 'Support en direct', de: 'Live-Support' },
    talkNow: { nl: 'Praat nu met ons', en: 'Talk to us now', fr: 'Parlez-nous maintenant', de: 'Sprechen Sie jetzt mit uns' },
  },

  // Footer
  footer: {
    tagline: { nl: 'De slimme receptionist voor elke KMO.', en: 'The smart receptionist for every SME.', fr: 'Le réceptionniste intelligent pour chaque PME.', de: 'Der smarte Rezeptionist für jedes KMU.' },
    product: { nl: 'Product', en: 'Product', fr: 'Produit', de: 'Produkt' },
    features: { nl: 'Functies', en: 'Features', fr: 'Fonctionnalités', de: 'Funktionen' },
    pricing: { nl: 'Prijzen', en: 'Pricing', fr: 'Tarifs', de: 'Preise' },
    company: { nl: 'Bedrijf', en: 'Company', fr: 'Entreprise', de: 'Unternehmen' },
    aboutUs: { nl: 'Over ons', en: 'About us', fr: 'À propos', de: 'Über uns' },
    contact: { nl: 'Contact', en: 'Contact', fr: 'Contact', de: 'Kontakt' },
    support: { nl: 'Support', en: 'Support', fr: 'Support', de: 'Support' },
    helpCenter: { nl: 'Help Center', en: 'Help Center', fr: 'Centre d\'aide', de: 'Hilfezentrum' },
    faq: { nl: 'FAQ', en: 'FAQ', fr: 'FAQ', de: 'FAQ' },
    privacy: { nl: 'Privacy', en: 'Privacy', fr: 'Confidentialité', de: 'Datenschutz' },
    terms: { nl: 'Voorwaarden', en: 'Terms', fr: 'Conditions', de: 'Bedingungen' },
    allRights: { nl: 'Alle rechten voorbehouden.', en: 'All rights reserved.', fr: 'Tous droits réservés.', de: 'Alle Rechte vorbehalten.' },
  },

  // Cookie Banner
  cookies: {
    title: { nl: 'Wij gebruiken cookies', en: 'We use cookies', fr: 'Nous utilisons des cookies', de: 'Wir verwenden Cookies' },
    message: { nl: 'Wij gebruiken cookies om onze website te laten functioneren en uw ervaring te verbeteren. Door op "Accepteren" te klikken, gaat u akkoord met ons', en: 'We use cookies to make our website work and improve your experience. By clicking "Accept", you agree to our', fr: 'Nous utilisons des cookies pour faire fonctionner notre site et améliorer votre expérience. En cliquant sur "Accepter", vous acceptez notre', de: 'Wir verwenden Cookies, um unsere Website zum Laufen zu bringen und Ihre Erfahrung zu verbessern. Durch Klicken auf "Akzeptieren" stimmen Sie unserer' },
    cookiePolicy: { nl: 'cookiebeleid', en: 'cookie policy', fr: 'politique de cookies', de: 'Cookie-Richtlinie' },
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
    liveDemo: { nl: 'Live demo', en: 'Live demo', fr: 'Démo en direct', de: 'Live-Demo' },
    listenDescription: { nl: 'Luister mee hoe VoxApp een afspraak boekt voor Kapsalon Belle', en: 'Listen to how VoxApp books an appointment for Salon Belle', fr: 'Écoutez comment VoxApp réserve un rendez-vous pour Salon Belle', de: 'Hören Sie, wie VoxApp einen Termin für Salon Belle bucht' },
    clickToStart: { nl: 'Klik op de knop hieronder om het gesprek te starten', en: 'Click the button below to start the conversation', fr: 'Cliquez sur le bouton ci-dessous pour démarrer la conversation', de: 'Klicken Sie auf die Schaltfläche unten, um das Gespräch zu starten' },
    receptionist: { nl: 'Receptionist', en: 'Receptionist', fr: 'Réceptionniste', de: 'Rezeptionist' },
    customer: { nl: 'Klant', en: 'Customer', fr: 'Client', de: 'Kunde' },
    startLiveDemo: { nl: 'Start live demo', en: 'Start live demo', fr: 'Démarrer la démo en direct', de: 'Live-Demo starten' },
    playAgain: { nl: 'Opnieuw afspelen', en: 'Play again', fr: 'Rejouer', de: 'Erneut abspielen' },
    callInProgress: { nl: 'Gesprek bezig...', en: 'Call in progress...', fr: 'Appel en cours...', de: 'Gespräch läuft...' },
    simulationNote: { nl: 'Dit is een simulatie van hoe VoxApp uw telefoongesprekken afhandelt.', en: 'This is a simulation of how VoxApp handles your phone calls.', fr: 'Ceci est une simulation de la façon dont VoxApp gère vos appels téléphoniques.', de: 'Dies ist eine Simulation, wie VoxApp Ihre Telefonanrufe abwickelt.' },
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
    voxappDesc: { nl: 'Onze slimme telefoniste voor KMO\'s. Beantwoordt oproepen 24/7, boekt afspraken automatisch en verhoogt uw klanttevredenheid. Beschikbaar in Nederlands, Frans en Engels.', en: 'Our smart receptionist for SMEs. Answers calls 24/7, books appointments automatically and increases your customer satisfaction. Available in Dutch, French and English.', fr: 'Notre réceptionniste intelligente pour les PME. Répond aux appels 24h/24, prend des rendez-vous automatiquement et augmente la satisfaction de vos clients. Disponible en néerlandais, français et anglais.', de: 'Unsere intelligente Rezeptionistin für KMU. Beantwortet Anrufe rund um die Uhr, bucht automatisch Termine und steigert Ihre Kundenzufriedenheit. Verfügbar in Niederländisch, Französisch und Englisch.' },
    webApps: { nl: 'Web applicaties', en: 'Web applications', fr: 'Applications web', de: 'Web-Anwendungen' },
    mobileApps: { nl: 'Mobiele apps', en: 'Mobile apps', fr: 'Applications mobiles', de: 'Mobile Apps' },
    apiIntegrations: { nl: 'API integraties', en: 'API integrations', fr: 'Intégrations API', de: 'API-Integrationen' },
    businessSoftware: { nl: 'Bedrijfssoftware', en: 'Business software', fr: 'Logiciel d\'entreprise', de: 'Unternehmenssoftware' },
    ecommerce: { nl: 'E-commerce platforms', en: 'E-commerce platforms', fr: 'Plateformes e-commerce', de: 'E-Commerce-Plattformen' },
    automation: { nl: 'Automatisering', en: 'Automation', fr: 'Automatisation', de: 'Automatisierung' },
    globalTitle: { nl: 'Wereldwijd actief', en: 'Active worldwide', fr: 'Actif dans le monde entier', de: 'Weltweit aktiv' },
    globalSubtitle: { nl: 'Vanuit ons hoofdkantoor in België bedienen wij klanten over de hele wereld. Onze software draait in meer dan 20 talen en wordt dagelijks gebruikt door honderdduizenden gebruikers.', en: 'From our headquarters in Belgium, we serve customers around the world. Our software runs in more than 20 languages and is used daily by hundreds of thousands of users.', fr: 'Depuis notre siège en Belgique, nous servons des clients du monde entier. Notre logiciel fonctionne dans plus de 20 langues et est utilisé quotidiennement par des centaines de milliers d\'utilisateurs.', de: 'Von unserem Hauptsitz in Belgien aus bedienen wir Kunden auf der ganzen Welt. Unsere Software läuft in mehr als 20 Sprachen und wird täglich von Hunderttausenden von Benutzern verwendet.' },
    countries: {
      belgium: { nl: 'België', en: 'Belgium', fr: 'Belgique', de: 'Belgien' },
      netherlands: { nl: 'Nederland', en: 'Netherlands', fr: 'Pays-Bas', de: 'Niederlande' },
      france: { nl: 'Frankrijk', en: 'France', fr: 'France', de: 'Frankreich' },
      germany: { nl: 'Duitsland', en: 'Germany', fr: 'Allemagne', de: 'Deutschland' },
      spain: { nl: 'Spanje', en: 'Spain', fr: 'Espagne', de: 'Spanien' },
      italy: { nl: 'Italië', en: 'Italy', fr: 'Italie', de: 'Italien' },
      uk: { nl: 'UK', en: 'UK', fr: 'Royaume-Uni', de: 'UK' },
      usa: { nl: 'USA', en: 'USA', fr: 'États-Unis', de: 'USA' },
    },
    contactTitle: { nl: 'Neem contact op', en: 'Get in touch', fr: 'Contactez-nous', de: 'Kontaktieren Sie uns' },
    contactSubtitle: { nl: 'Heeft u vragen of wilt u meer weten over onze diensten?', en: 'Do you have questions or would you like to know more about our services?', fr: 'Vous avez des questions ou souhaitez en savoir plus sur nos services?', de: 'Haben Sie Fragen oder möchten Sie mehr über unsere Dienstleistungen erfahren?' },
    websitesLabel: { nl: 'Websites', en: 'Websites', fr: 'Sites web', de: 'Websites' },
    addressLabel: { nl: 'Adres', en: 'Address', fr: 'Adresse', de: 'Adresse' },
    globalPresence: { nl: 'Wereldwijd actief', en: 'Active worldwide', fr: 'Actif dans le monde entier', de: 'Weltweit aktiv' },
    globalPresenceDesc: { nl: 'Vanuit ons hoofdkantoor in België bedienen wij klanten over de hele wereld. Onze software draait in meer dan 20 talen en wordt dagelijks gebruikt door honderdduizenden gebruikers.', en: 'From our headquarters in Belgium, we serve customers around the world. Our software runs in more than 20 languages and is used daily by hundreds of thousands of users.', fr: 'Depuis notre siège en Belgique, nous servons des clients du monde entier. Notre logiciel fonctionne dans plus de 20 langues et est utilisé quotidiennement par des centaines de milliers d\'utilisateurs.', de: 'Von unserem Hauptsitz in Belgien aus bedienen wir Kunden auf der ganzen Welt. Unsere Software läuft in mehr als 20 Sprachen und wird täglich von Hunderttausenden von Benutzern verwendet.' },
    haveQuestions: { nl: 'Heeft u vragen of wilt u meer weten over onze diensten?', en: 'Do you have questions or would you like to know more about our services?', fr: 'Vous avez des questions ou souhaitez en savoir plus sur nos services?', de: 'Haben Sie Fragen oder möchten Sie mehr über unsere Dienstleistungen erfahren?' },
  },

  // Privacy Page
  privacy: {
    title: { nl: 'Privacybeleid', en: 'Privacy Policy', fr: 'Politique de confidentialité', de: 'Datenschutzrichtlinie' },
    lastUpdated: { nl: 'Laatst bijgewerkt: februari 2026', en: 'Last updated: February 2026', fr: 'Dernière mise à jour: février 2026', de: 'Zuletzt aktualisiert: Februar 2026' },
    section1: {
      title: { nl: '1. Inleiding', en: '1. Introduction', fr: '1. Introduction', de: '1. Einleitung' },
      content: { nl: 'VoxApp, onderdeel van Vysion Horeca, respecteert uw privacy en zet zich in voor de bescherming van uw persoonsgegevens. Dit privacybeleid legt uit hoe wij uw gegevens verzamelen, gebruiken en beschermen wanneer u onze diensten gebruikt.', en: 'VoxApp, part of Vysion Horeca, respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use and protect your data when you use our services.', fr: 'VoxApp, qui fait partie de Vysion Horeca, respecte votre vie privée et s\'engage à protéger vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données lorsque vous utilisez nos services.', de: 'VoxApp, Teil von Vysion Horeca, respektiert Ihre Privatsphäre und ist dem Schutz Ihrer personenbezogenen Daten verpflichtet. Diese Datenschutzrichtlinie erklärt, wie wir Ihre Daten sammeln, verwenden und schützen, wenn Sie unsere Dienste nutzen.' },
    },
    section2: {
      title: { nl: '2. Welke gegevens verzamelen wij?', en: '2. What data do we collect?', fr: '2. Quelles données collectons-nous?', de: '2. Welche Daten erheben wir?' },
      intro: { nl: 'Wij verzamelen de volgende gegevens:', en: 'We collect the following data:', fr: 'Nous collectons les données suivantes:', de: 'Wir erheben folgende Daten:' },
      item1: { nl: 'Bedrijfsgegevens (naam, adres, telefoonnummer, e-mail)', en: 'Business data (name, address, phone number, email)', fr: 'Données d\'entreprise (nom, adresse, numéro de téléphone, e-mail)', de: 'Unternehmensdaten (Name, Adresse, Telefonnummer, E-Mail)' },
      item2: { nl: 'Accountgegevens (naam, e-mailadres, wachtwoord)', en: 'Account data (name, email address, password)', fr: 'Données de compte (nom, adresse e-mail, mot de passe)', de: 'Kontodaten (Name, E-Mail-Adresse, Passwort)' },
      item3: { nl: 'Gespreksgegevens (transcripties van telefoongesprekken)', en: 'Call data (transcripts of phone calls)', fr: 'Données d\'appel (transcriptions d\'appels téléphoniques)', de: 'Anrufdaten (Transkripte von Telefongesprächen)' },
      item4: { nl: 'Afspraakgegevens (datum, tijd, klantinformatie)', en: 'Appointment data (date, time, customer information)', fr: 'Données de rendez-vous (date, heure, informations client)', de: 'Termindaten (Datum, Uhrzeit, Kundeninformationen)' },
      item5: { nl: 'Betalingsgegevens (via onze betalingspartner Stripe)', en: 'Payment data (via our payment partner Stripe)', fr: 'Données de paiement (via notre partenaire de paiement Stripe)', de: 'Zahlungsdaten (über unseren Zahlungspartner Stripe)' },
    },
    section3: {
      title: { nl: '3. Waarvoor gebruiken wij uw gegevens?', en: '3. What do we use your data for?', fr: '3. À quoi utilisons-nous vos données?', de: '3. Wofür verwenden wir Ihre Daten?' },
      item1: { nl: 'Het leveren en verbeteren van onze diensten', en: 'Providing and improving our services', fr: 'Fournir et améliorer nos services', de: 'Bereitstellung und Verbesserung unserer Dienste' },
      item2: { nl: 'Het verwerken van telefoongesprekken en afspraken', en: 'Processing phone calls and appointments', fr: 'Traitement des appels téléphoniques et des rendez-vous', de: 'Verarbeitung von Telefongesprächen und Terminen' },
      item3: { nl: 'Het versturen van SMS-bevestigingen naar uw klanten', en: 'Sending SMS confirmations to your customers', fr: 'Envoi de confirmations SMS à vos clients', de: 'Versenden von SMS-Bestätigungen an Ihre Kunden' },
      item4: { nl: 'Facturatie en betalingsverwerking', en: 'Billing and payment processing', fr: 'Facturation et traitement des paiements', de: 'Rechnungsstellung und Zahlungsabwicklung' },
      item5: { nl: 'Klantenondersteuning', en: 'Customer support', fr: 'Support client', de: 'Kundenbetreuung' },
      item6: { nl: 'Het naleven van wettelijke verplichtingen', en: 'Compliance with legal obligations', fr: 'Respect des obligations légales', de: 'Einhaltung gesetzlicher Verpflichtungen' },
    },
    section4: {
      title: { nl: '4. Gegevensbeveiliging', en: '4. Data Security', fr: '4. Sécurité des données', de: '4. Datensicherheit' },
      content: { nl: 'Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen tegen ongeoorloofde toegang, verlies of misbruik. Alle gegevens worden versleuteld opgeslagen en onze servers bevinden zich binnen de Europese Unie.', en: 'We take appropriate technical and organizational measures to protect your data against unauthorized access, loss or misuse. All data is stored encrypted and our servers are located within the European Union.', fr: 'Nous prenons des mesures techniques et organisationnelles appropriées pour protéger vos données contre l\'accès non autorisé, la perte ou l\'utilisation abusive. Toutes les données sont stockées cryptées et nos serveurs sont situés dans l\'Union européenne.', de: 'Wir treffen angemessene technische und organisatorische Maßnahmen, um Ihre Daten vor unbefugtem Zugriff, Verlust oder Missbrauch zu schützen. Alle Daten werden verschlüsselt gespeichert und unsere Server befinden sich innerhalb der Europäischen Union.' },
    },
    section5: {
      title: { nl: '5. Bewaartermijn', en: '5. Retention Period', fr: '5. Durée de conservation', de: '5. Aufbewahrungsfrist' },
      content: { nl: 'Wij bewaren uw gegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn verzameld. Gespreksopnames worden maximaal 90 dagen bewaard, tenzij u anders verzoekt.', en: 'We do not retain your data longer than necessary for the purposes for which they were collected. Call recordings are kept for a maximum of 90 days, unless you request otherwise.', fr: 'Nous ne conservons pas vos données plus longtemps que nécessaire pour les finalités pour lesquelles elles ont été collectées. Les enregistrements d\'appels sont conservés pendant un maximum de 90 jours, sauf demande contraire de votre part.', de: 'Wir bewahren Ihre Daten nicht länger auf, als es für die Zwecke, für die sie erhoben wurden, erforderlich ist. Anrufaufzeichnungen werden maximal 90 Tage aufbewahrt, sofern Sie nichts anderes verlangen.' },
    },
    section6: {
      title: { nl: '6. Uw rechten', en: '6. Your Rights', fr: '6. Vos droits', de: '6. Ihre Rechte' },
      intro: { nl: 'Onder de GDPR heeft u de volgende rechten:', en: 'Under the GDPR, you have the following rights:', fr: 'En vertu du RGPD, vous avez les droits suivants:', de: 'Nach der DSGVO haben Sie folgende Rechte:' },
      item1: { nl: 'Recht op inzage in uw gegevens', en: 'Right to access your data', fr: 'Droit d\'accès à vos données', de: 'Recht auf Zugang zu Ihren Daten' },
      item2: { nl: 'Recht op rectificatie van onjuiste gegevens', en: 'Right to rectification of inaccurate data', fr: 'Droit de rectification des données inexactes', de: 'Recht auf Berichtigung unrichtiger Daten' },
      item3: { nl: 'Recht op verwijdering van uw gegevens', en: 'Right to erasure of your data', fr: 'Droit à l\'effacement de vos données', de: 'Recht auf Löschung Ihrer Daten' },
      item4: { nl: 'Recht op beperking van de verwerking', en: 'Right to restriction of processing', fr: 'Droit à la limitation du traitement', de: 'Recht auf Einschränkung der Verarbeitung' },
      item5: { nl: 'Recht op overdraagbaarheid van gegevens', en: 'Right to data portability', fr: 'Droit à la portabilité des données', de: 'Recht auf Datenübertragbarkeit' },
      item6: { nl: 'Recht om bezwaar te maken tegen verwerking', en: 'Right to object to processing', fr: 'Droit d\'opposition au traitement', de: 'Recht auf Widerspruch gegen die Verarbeitung' },
    },
    section7: {
      title: { nl: '7. Cookies', en: '7. Cookies', fr: '7. Cookies', de: '7. Cookies' },
      content: { nl: 'Wij gebruiken cookies om onze website te laten functioneren en om uw ervaring te verbeteren. U kunt uw cookievoorkeuren aanpassen via de cookiebanner op onze website.', en: 'We use cookies to make our website work and to improve your experience. You can adjust your cookie preferences via the cookie banner on our website.', fr: 'Nous utilisons des cookies pour faire fonctionner notre site web et améliorer votre expérience. Vous pouvez ajuster vos préférences en matière de cookies via la bannière de cookies sur notre site web.', de: 'Wir verwenden Cookies, um unsere Website zum Laufen zu bringen und Ihre Erfahrung zu verbessern. Sie können Ihre Cookie-Einstellungen über das Cookie-Banner auf unserer Website anpassen.' },
    },
    section8: {
      title: { nl: '8. Contact', en: '8. Contact', fr: '8. Contact', de: '8. Kontakt' },
      content: { nl: 'Voor vragen over dit privacybeleid of om uw rechten uit te oefenen, kunt u contact opnemen via:', en: 'For questions about this privacy policy or to exercise your rights, please contact us at:', fr: 'Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, veuillez nous contacter à:', de: 'Bei Fragen zu dieser Datenschutzrichtlinie oder zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter:' },
    },
  },

  // Terms Page
  terms: {
    title: { nl: 'Algemene Voorwaarden', en: 'Terms and Conditions', fr: 'Conditions Générales', de: 'Allgemeine Geschäftsbedingungen' },
    lastUpdated: { nl: 'Laatst bijgewerkt: februari 2026', en: 'Last updated: February 2026', fr: 'Dernière mise à jour: février 2026', de: 'Zuletzt aktualisiert: Februar 2026' },
    section1: {
      title: { nl: '1. Definities', en: '1. Definitions', fr: '1. Définitions', de: '1. Definitionen' },
      voxapp: { nl: 'De dienst aangeboden door Vysion Horeca, gevestigd in België.', en: 'The service offered by Vysion Horeca, based in Belgium.', fr: 'Le service offert par Vysion Horeca, basé en Belgique.', de: 'Der von Vysion Horeca angebotene Dienst mit Sitz in Belgien.' },
      customerLabel: { nl: 'Klant', en: 'Customer', fr: 'Client', de: 'Kunde' },
      customer: { nl: 'De natuurlijke of rechtspersoon die gebruik maakt van de diensten van VoxApp.', en: 'The natural or legal person using VoxApp services.', fr: 'La personne physique ou morale qui utilise les services de VoxApp.', de: 'Die natürliche oder juristische Person, die die Dienste von VoxApp nutzt.' },
      servicesLabel: { nl: 'Diensten', en: 'Services', fr: 'Services', de: 'Dienste' },
      services: { nl: 'De slimme receptionist en gerelateerde functionaliteiten aangeboden door VoxApp.', en: 'The smart receptionist and related functionalities offered by VoxApp.', fr: 'Le réceptionniste intelligent et les fonctionnalités connexes offertes par VoxApp.', de: 'Der intelligente Rezeptionist und verwandte Funktionalitäten, die von VoxApp angeboten werden.' },
    },
    section2: {
      title: { nl: '2. Toepasselijkheid', en: '2. Applicability', fr: '2. Applicabilité', de: '2. Anwendbarkeit' },
      content: { nl: 'Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten tussen VoxApp en de Klant. Door gebruik te maken van onze diensten, gaat u akkoord met deze voorwaarden.', en: 'These terms and conditions apply to all agreements between VoxApp and the Customer. By using our services, you agree to these terms.', fr: 'Ces conditions générales s\'appliquent à tous les accords entre VoxApp et le Client. En utilisant nos services, vous acceptez ces conditions.', de: 'Diese Allgemeinen Geschäftsbedingungen gelten für alle Vereinbarungen zwischen VoxApp und dem Kunden. Durch die Nutzung unserer Dienste stimmen Sie diesen Bedingungen zu.' },
    },
    section3: {
      title: { nl: '3. Dienstverlening', en: '3. Service Delivery', fr: '3. Prestation de services', de: '3. Dienstleistung' },
      content: { nl: 'VoxApp biedt een slimme telefonische receptionist die telefoongesprekken beantwoordt, afspraken inboekt en veelgestelde vragen beantwoordt namens de Klant. Wij streven naar een uptime van 99.9%.', en: 'VoxApp offers a smart telephone receptionist that answers phone calls, books appointments and answers frequently asked questions on behalf of the Customer. We strive for 99.9% uptime.', fr: 'VoxApp offre un réceptionniste téléphonique intelligent qui répond aux appels téléphoniques, prend des rendez-vous et répond aux questions fréquentes au nom du Client. Nous visons une disponibilité de 99,9%.', de: 'VoxApp bietet einen intelligenten Telefonrezeptionisten, der Anrufe entgegennimmt, Termine bucht und häufig gestellte Fragen im Namen des Kunden beantwortet. Wir streben eine Verfügbarkeit von 99,9% an.' },
    },
    section4: {
      title: { nl: '4. Abonnementen en Prijzen', en: '4. Subscriptions and Pricing', fr: '4. Abonnements et tarifs', de: '4. Abonnements und Preise' },
      starter: { nl: '€99/maand - 375 minuten inbegrepen', en: '€99/month - 375 minutes included', fr: '99€/mois - 375 minutes incluses', de: '99€/Monat - 375 Minuten inklusive' },
      pro: { nl: '€149/maand - 940 minuten inbegrepen', en: '€149/month - 940 minutes included', fr: '149€/mois - 940 minutes incluses', de: '149€/Monat - 940 Minuten inklusive' },
      business: { nl: '€249/maand - 1875 minuten inbegrepen', en: '€249/month - 1875 minutes included', fr: '249€/mois - 1875 minutes incluses', de: '249€/Monat - 1875 Minuten inklusive' },
      trial: { nl: 'De eerste 7 dagen zijn gratis. Daarna wordt het abonnement maandelijks gefactureerd. Extra minuten worden aan het einde van de maand in rekening gebracht.', en: 'The first 7 days are free. After that, the subscription is billed monthly. Extra minutes are charged at the end of the month.', fr: 'Les 7 premiers jours sont gratuits. Ensuite, l\'abonnement est facturé mensuellement. Les minutes supplémentaires sont facturées à la fin du mois.', de: 'Die ersten 7 Tage sind kostenlos. Danach wird das Abonnement monatlich abgerechnet. Zusätzliche Minuten werden am Ende des Monats berechnet.' },
    },
    section5: {
      title: { nl: '5. Betaling', en: '5. Payment', fr: '5. Paiement', de: '5. Zahlung' },
      content: { nl: 'Betaling geschiedt via automatische incasso of creditcard via onze betalingspartner Stripe. Facturen worden maandelijks verstuurd. Bij niet-tijdige betaling behouden wij ons het recht voor de dienstverlening op te schorten.', en: 'Payment is made by direct debit or credit card via our payment partner Stripe. Invoices are sent monthly. In case of late payment, we reserve the right to suspend the service.', fr: 'Le paiement s\'effectue par prélèvement automatique ou carte de crédit via notre partenaire de paiement Stripe. Les factures sont envoyées mensuellement. En cas de retard de paiement, nous nous réservons le droit de suspendre le service.', de: 'Die Zahlung erfolgt per Lastschrift oder Kreditkarte über unseren Zahlungspartner Stripe. Rechnungen werden monatlich verschickt. Bei verspäteter Zahlung behalten wir uns das Recht vor, den Dienst auszusetzen.' },
    },
    section6: {
      title: { nl: '6. Opzegging', en: '6. Cancellation', fr: '6. Résiliation', de: '6. Kündigung' },
      content: { nl: 'U kunt uw abonnement op elk moment opzeggen via uw dashboard. De opzegging gaat in aan het einde van de lopende facturatieperiode. Er is geen opzegtermijn en geen contractuele binding.', en: 'You can cancel your subscription at any time via your dashboard. Cancellation takes effect at the end of the current billing period. There is no notice period and no contractual commitment.', fr: 'Vous pouvez annuler votre abonnement à tout moment via votre tableau de bord. La résiliation prend effet à la fin de la période de facturation en cours. Il n\'y a pas de préavis et pas d\'engagement contractuel.', de: 'Sie können Ihr Abonnement jederzeit über Ihr Dashboard kündigen. Die Kündigung wird am Ende des aktuellen Abrechnungszeitraums wirksam. Es gibt keine Kündigungsfrist und keine vertragliche Bindung.' },
    },
    section7: {
      title: { nl: '7. Aansprakelijkheid', en: '7. Liability', fr: '7. Responsabilité', de: '7. Haftung' },
      content: { nl: 'VoxApp is niet aansprakelijk voor indirecte schade, gevolgschade of gederfde winst. Onze totale aansprakelijkheid is beperkt tot het bedrag dat de Klant in de afgelopen 12 maanden aan VoxApp heeft betaald.', en: 'VoxApp is not liable for indirect damage, consequential damage or lost profits. Our total liability is limited to the amount the Customer has paid to VoxApp in the past 12 months.', fr: 'VoxApp n\'est pas responsable des dommages indirects, des dommages consécutifs ou des pertes de profits. Notre responsabilité totale est limitée au montant que le Client a payé à VoxApp au cours des 12 derniers mois.', de: 'VoxApp haftet nicht für indirekte Schäden, Folgeschäden oder entgangenen Gewinn. Unsere Gesamthaftung ist auf den Betrag beschränkt, den der Kunde in den letzten 12 Monaten an VoxApp gezahlt hat.' },
    },
    section8: {
      title: { nl: '8. Intellectueel Eigendom', en: '8. Intellectual Property', fr: '8. Propriété intellectuelle', de: '8. Geistiges Eigentum' },
      content: { nl: 'Alle intellectuele eigendomsrechten op de software, technologie en content van VoxApp blijven eigendom van Vysion Horeca. De Klant krijgt een beperkt gebruiksrecht voor de duur van het abonnement.', en: 'All intellectual property rights to VoxApp software, technology and content remain the property of Vysion Horeca. The Customer receives a limited right of use for the duration of the subscription.', fr: 'Tous les droits de propriété intellectuelle sur le logiciel, la technologie et le contenu de VoxApp restent la propriété de Vysion Horeca. Le Client reçoit un droit d\'utilisation limité pour la durée de l\'abonnement.', de: 'Alle geistigen Eigentumsrechte an der Software, Technologie und dem Inhalt von VoxApp bleiben Eigentum von Vysion Horeca. Der Kunde erhält ein begrenztes Nutzungsrecht für die Dauer des Abonnements.' },
    },
    section9: {
      title: { nl: '9. Wijzigingen', en: '9. Changes', fr: '9. Modifications', de: '9. Änderungen' },
      content: { nl: 'VoxApp behoudt zich het recht voor deze voorwaarden te wijzigen. Wijzigingen worden minimaal 30 dagen van tevoren aangekondigd via e-mail of via het dashboard.', en: 'VoxApp reserves the right to change these terms. Changes will be announced at least 30 days in advance via email or the dashboard.', fr: 'VoxApp se réserve le droit de modifier ces conditions. Les modifications seront annoncées au moins 30 jours à l\'avance par e-mail ou via le tableau de bord.', de: 'VoxApp behält sich das Recht vor, diese Bedingungen zu ändern. Änderungen werden mindestens 30 Tage im Voraus per E-Mail oder über das Dashboard angekündigt.' },
    },
    section10: {
      title: { nl: '10. Toepasselijk Recht', en: '10. Applicable Law', fr: '10. Droit applicable', de: '10. Anwendbares Recht' },
      content: { nl: 'Op deze voorwaarden is Belgisch recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechtbank in België.', en: 'These terms are governed by Belgian law. Disputes will be submitted to the competent court in Belgium.', fr: 'Ces conditions sont régies par le droit belge. Les litiges seront soumis au tribunal compétent en Belgique.', de: 'Diese Bedingungen unterliegen belgischem Recht. Streitigkeiten werden dem zuständigen Gericht in Belgien vorgelegt.' },
    },
    section11: {
      title: { nl: '11. Contact', en: '11. Contact', fr: '11. Contact', de: '11. Kontakt' },
      content: { nl: 'Voor vragen over deze voorwaarden kunt u contact opnemen via:', en: 'For questions about these terms, please contact us at:', fr: 'Pour toute question concernant ces conditions, veuillez nous contacter à:', de: 'Bei Fragen zu diesen Bedingungen kontaktieren Sie uns bitte unter:' },
    },
  },

  // Dashboard
  dashboard: {
    title: { nl: 'Dashboard', en: 'Dashboard', fr: 'Tableau de bord', de: 'Dashboard' },
    welcomeBack: { nl: 'Welkom terug!', en: 'Welcome back!', fr: 'Bienvenue!', de: 'Willkommen zurück!' },
    overview: { nl: 'Hier is een overzicht van je bedrijf vandaag.', en: 'Here is an overview of your business today.', fr: 'Voici un aperçu de votre entreprise aujourd\'hui.', de: 'Hier ist eine Übersicht Ihres Unternehmens heute.' },
    loading: { nl: 'Laden...', en: 'Loading...', fr: 'Chargement...', de: 'Laden...' },
    appointmentsToday: { nl: 'Afspraken vandaag', en: 'Appointments today', fr: 'Rendez-vous aujourd\'hui', de: 'Termine heute' },
    conversationsToday: { nl: 'Gesprekken vandaag', en: 'Conversations today', fr: 'Conversations aujourd\'hui', de: 'Gespräche heute' },
    missedCalls: { nl: 'Gemiste oproepen', en: 'Missed calls', fr: 'Appels manqués', de: 'Verpasste Anrufe' },
    thisMonth: { nl: 'Deze maand', en: 'This month', fr: 'Ce mois-ci', de: 'Diesen Monat' },
    newAppointment: { nl: 'Nieuwe afspraak', en: 'New appointment', fr: 'Nouveau rendez-vous', de: 'Neuer Termin' },
    noAppointmentsToday: { nl: 'Geen afspraken voor vandaag', en: 'No appointments for today', fr: 'Pas de rendez-vous pour aujourd\'hui', de: 'Keine Termine für heute' },
    appointment: { nl: 'Afspraak', en: 'Appointment', fr: 'Rendez-vous', de: 'Termin' },
    status: {
      confirmed: { nl: 'Bevestigd', en: 'Confirmed', fr: 'Confirmé', de: 'Bestätigt' },
      scheduled: { nl: 'Gepland', en: 'Scheduled', fr: 'Planifié', de: 'Geplant' },
      completed: { nl: 'Voltooid', en: 'Completed', fr: 'Terminé', de: 'Abgeschlossen' },
      cancelled: { nl: 'Geannuleerd', en: 'Cancelled', fr: 'Annulé', de: 'Storniert' },
      noShow: { nl: 'No-show', en: 'No-show', fr: 'Absent', de: 'Nicht erschienen' },
    },
    nav: {
      dashboard: { nl: 'Dashboard', en: 'Dashboard', fr: 'Tableau de bord', de: 'Dashboard' },
      appointments: { nl: 'Afspraken', en: 'Appointments', fr: 'Rendez-vous', de: 'Termine' },
      services: { nl: 'Diensten', en: 'Services', fr: 'Services', de: 'Dienste' },
      products: { nl: 'Producten', en: 'Products', fr: 'Produits', de: 'Produkte' },
      options: { nl: 'Opties', en: 'Options', fr: 'Options', de: 'Optionen' },
      staff: { nl: 'Medewerkers', en: 'Staff', fr: 'Personnel', de: 'Mitarbeiter' },
      conversations: { nl: 'Gesprekken', en: 'Conversations', fr: 'Conversations', de: 'Gespräche' },
      reception: { nl: 'Receptie', en: 'Reception', fr: 'Réception', de: 'Rezeption' },
      settings: { nl: 'Instellingen', en: 'Settings', fr: 'Paramètres', de: 'Einstellungen' },
      logout: { nl: 'Uitloggen', en: 'Log out', fr: 'Déconnexion', de: 'Abmelden' },
    },
    trialDaysRemaining: { nl: 'dagen over', en: 'days remaining', fr: 'jours restants', de: 'Tage verbleibend' },
    activeSubscription: { nl: 'Actief abonnement', en: 'Active subscription', fr: 'Abonnement actif', de: 'Aktives Abonnement' },
    trialPeriod: { nl: 'Proefperiode', en: 'Trial period', fr: 'Période d\'essai', de: 'Testzeitraum' },
  },

  // Auth pages
  auth: {
    login: { nl: 'Inloggen', en: 'Log in', fr: 'Connexion', de: 'Anmelden' },
    loginTitle: { nl: 'Log in op je account', en: 'Log in to your account', fr: 'Connectez-vous à votre compte', de: 'Melden Sie sich bei Ihrem Konto an' },
    email: { nl: 'E-mailadres', en: 'Email address', fr: 'Adresse e-mail', de: 'E-Mail-Adresse' },
    password: { nl: 'Wachtwoord', en: 'Password', fr: 'Mot de passe', de: 'Passwort' },
    loggingIn: { nl: 'Bezig...', en: 'Logging in...', fr: 'Connexion...', de: 'Anmeldung...' },
    noAccount: { nl: 'Nog geen account?', en: 'No account yet?', fr: 'Pas encore de compte?', de: 'Noch kein Konto?' },
    registerFree: { nl: 'Registreer gratis', en: 'Register for free', fr: 'S\'inscrire gratuitement', de: 'Kostenlos registrieren' },
    somethingWentWrong: { nl: 'Er ging iets mis. Probeer het opnieuw.', en: 'Something went wrong. Please try again.', fr: 'Une erreur s\'est produite. Veuillez réessayer.', de: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.' },
    register: { nl: 'Registreren', en: 'Register', fr: 'S\'inscrire', de: 'Registrieren' },
    startTrial: { nl: 'Start je gratis proefperiode van 7 dagen', en: 'Start your free 7-day trial', fr: 'Commencez votre essai gratuit de 7 jours', de: 'Starten Sie Ihre kostenlose 7-tägige Testphase' },
    aboutBusiness: { nl: 'Over je bedrijf', en: 'About your business', fr: 'À propos de votre entreprise', de: 'Über Ihr Unternehmen' },
    businessName: { nl: 'Bedrijfsnaam', en: 'Business name', fr: 'Nom de l\'entreprise', de: 'Firmenname' },
    businessType: { nl: 'Type bedrijf', en: 'Business type', fr: 'Type d\'entreprise', de: 'Unternehmenstyp' },
    phoneNumber: { nl: 'Telefoonnummer', en: 'Phone number', fr: 'Numéro de téléphone', de: 'Telefonnummer' },
    selectType: { nl: 'Selecteer type...', en: 'Select type...', fr: 'Sélectionnez le type...', de: 'Typ auswählen...' },
    next: { nl: 'Volgende', en: 'Next', fr: 'Suivant', de: 'Weiter' },
    back: { nl: 'Terug', en: 'Back', fr: 'Retour', de: 'Zurück' },
    yourAccount: { nl: 'Je account', en: 'Your account', fr: 'Votre compte', de: 'Ihr Konto' },
    minChars: { nl: 'Minimaal 6 karakters', en: 'Minimum 6 characters', fr: 'Minimum 6 caractères', de: 'Mindestens 6 Zeichen' },
    creatingAccount: { nl: 'Account aanmaken...', en: 'Creating account...', fr: 'Création du compte...', de: 'Konto erstellen...' },
    startFreeTrial: { nl: 'Start gratis proefperiode', en: 'Start free trial', fr: 'Commencer l\'essai gratuit', de: 'Kostenlose Testphase starten' },
    alreadyAccount: { nl: 'Al een account?', en: 'Already have an account?', fr: 'Vous avez déjà un compte?', de: 'Bereits ein Konto?' },
    businessTypes: {
      salon: { nl: 'Kapsalon / Schoonheidssalon', en: 'Hair salon / Beauty salon', fr: 'Salon de coiffure / Institut de beauté', de: 'Friseursalon / Schönheitssalon' },
      garage: { nl: 'Garage / Autoservice', en: 'Garage / Car service', fr: 'Garage / Service automobile', de: 'Werkstatt / Autoservice' },
      restaurant: { nl: 'Restaurant / Café', en: 'Restaurant / Café', fr: 'Restaurant / Café', de: 'Restaurant / Café' },
      takeaway: { nl: 'Frituur / Takeaway', en: 'Snack bar / Takeaway', fr: 'Friterie / À emporter', de: 'Imbiss / Takeaway' },
      doctor: { nl: 'Huisarts / Dokter', en: 'General practitioner / Doctor', fr: 'Médecin généraliste', de: 'Hausarzt / Arzt' },
      dentist: { nl: 'Tandarts', en: 'Dentist', fr: 'Dentiste', de: 'Zahnarzt' },
      physio: { nl: 'Kinesist / Fysiotherapeut', en: 'Physiotherapist', fr: 'Kinésithérapeute', de: 'Physiotherapeut' },
      other: { nl: 'Andere', en: 'Other', fr: 'Autre', de: 'Andere' },
    },
  },

  // Common
  common: {
    save: { nl: 'Opslaan', en: 'Save', fr: 'Enregistrer', de: 'Speichern' },
    cancel: { nl: 'Annuleren', en: 'Cancel', fr: 'Annuler', de: 'Abbrechen' },
    delete: { nl: 'Verwijderen', en: 'Delete', fr: 'Supprimer', de: 'Löschen' },
    edit: { nl: 'Bewerken', en: 'Edit', fr: 'Modifier', de: 'Bearbeiten' },
    add: { nl: 'Toevoegen', en: 'Add', fr: 'Ajouter', de: 'Hinzufügen' },
    close: { nl: 'Sluiten', en: 'Close', fr: 'Fermer', de: 'Schließen' },
    confirm: { nl: 'Bevestigen', en: 'Confirm', fr: 'Confirmer', de: 'Bestätigen' },
    search: { nl: 'Zoeken', en: 'Search', fr: 'Rechercher', de: 'Suchen' },
    filter: { nl: 'Filteren', en: 'Filter', fr: 'Filtrer', de: 'Filtern' },
    actions: { nl: 'Acties', en: 'Actions', fr: 'Actions', de: 'Aktionen' },
    name: { nl: 'Naam', en: 'Name', fr: 'Nom', de: 'Name' },
    phone: { nl: 'Telefoon', en: 'Phone', fr: 'Téléphone', de: 'Telefon' },
    minutes: { nl: 'minuten', en: 'minutes', fr: 'minutes', de: 'Minuten' },
    hours: { nl: 'uur', en: 'hours', fr: 'heures', de: 'Stunden' },
    days: { nl: 'dagen', en: 'days', fr: 'jours', de: 'Tage' },
    yes: { nl: 'Ja', en: 'Yes', fr: 'Oui', de: 'Ja' },
    no: { nl: 'Nee', en: 'No', fr: 'Non', de: 'Nein' },
    active: { nl: 'Actief', en: 'Active', fr: 'Actif', de: 'Aktiv' },
    inactive: { nl: 'Inactief', en: 'Inactive', fr: 'Inactif', de: 'Inaktiv' },
  },

  // Services page
  services: {
    title: { nl: 'Diensten', en: 'Services', fr: 'Services', de: 'Dienste' },
    subtitle: { nl: 'Beheer de diensten die je aanbiedt.', en: 'Manage the services you offer.', fr: 'Gérez les services que vous proposez.', de: 'Verwalten Sie die Dienste, die Sie anbieten.' },
    addService: { nl: 'Dienst toevoegen', en: 'Add service', fr: 'Ajouter un service', de: 'Dienst hinzufügen' },
    noServices: { nl: 'Nog geen diensten', en: 'No services yet', fr: 'Pas encore de services', de: 'Noch keine Dienste' },
    addFirstService: { nl: 'Voeg je eerste dienst toe', en: 'Add your first service', fr: 'Ajoutez votre premier service', de: 'Fügen Sie Ihren ersten Dienst hinzu' },
    serviceName: { nl: 'Naam dienst', en: 'Service name', fr: 'Nom du service', de: 'Dienstname' },
    duration: { nl: 'Duur', en: 'Duration', fr: 'Durée', de: 'Dauer' },
    price: { nl: 'Prijs', en: 'Price', fr: 'Prix', de: 'Preis' },
    description: { nl: 'Beschrijving', en: 'Description', fr: 'Description', de: 'Beschreibung' },
  },

  // Staff page
  staff: {
    title: { nl: 'Medewerkers', en: 'Staff', fr: 'Personnel', de: 'Mitarbeiter' },
    subtitle: { nl: 'Beheer je team en hun beschikbaarheid.', en: 'Manage your team and their availability.', fr: 'Gérez votre équipe et leur disponibilité.', de: 'Verwalten Sie Ihr Team und deren Verfügbarkeit.' },
    addStaff: { nl: 'Medewerker toevoegen', en: 'Add staff member', fr: 'Ajouter un employé', de: 'Mitarbeiter hinzufügen' },
    noStaff: { nl: 'Nog geen medewerkers', en: 'No staff members yet', fr: 'Pas encore d\'employés', de: 'Noch keine Mitarbeiter' },
    addFirstStaff: { nl: 'Voeg je eerste medewerker toe', en: 'Add your first staff member', fr: 'Ajoutez votre premier employé', de: 'Fügen Sie Ihren ersten Mitarbeiter hinzu' },
    staffName: { nl: 'Naam medewerker', en: 'Staff name', fr: 'Nom de l\'employé', de: 'Mitarbeitername' },
    role: { nl: 'Functie', en: 'Role', fr: 'Fonction', de: 'Position' },
    workingHours: { nl: 'Werkuren', en: 'Working hours', fr: 'Heures de travail', de: 'Arbeitszeiten' },
  },

  // Conversations page
  conversations: {
    title: { nl: 'Gesprekken', en: 'Conversations', fr: 'Conversations', de: 'Gespräche' },
    subtitle: { nl: 'Bekijk alle telefoongesprekken.', en: 'View all phone conversations.', fr: 'Consultez toutes les conversations téléphoniques.', de: 'Sehen Sie alle Telefongespräche.' },
    noConversations: { nl: 'Nog geen gesprekken', en: 'No conversations yet', fr: 'Pas encore de conversations', de: 'Noch keine Gespräche' },
    noConversationsHint: { nl: 'Zodra de receptie actief is, verschijnen gesprekken hier.', en: 'Once the reception is active, conversations will appear here.', fr: 'Une fois la réception active, les conversations apparaîtront ici.', de: 'Sobald die Rezeption aktiv ist, erscheinen hier Gespräche.' },
    duration: { nl: 'Duur', en: 'Duration', fr: 'Durée', de: 'Dauer' },
    caller: { nl: 'Beller', en: 'Caller', fr: 'Appelant', de: 'Anrufer' },
    outcome: { nl: 'Resultaat', en: 'Outcome', fr: 'Résultat', de: 'Ergebnis' },
  },

  // AI Settings page
  aiSettings: {
    title: { nl: 'Receptie Instellingen', en: 'Reception Settings', fr: 'Paramètres de réception', de: 'Rezeptionseinstellungen' },
    subtitle: { nl: 'Configureer je virtuele receptionist.', en: 'Configure your virtual receptionist.', fr: 'Configurez votre réceptionniste virtuel.', de: 'Konfigurieren Sie Ihren virtuellen Rezeptionisten.' },
    welcomeMessage: { nl: 'Welkomstbericht', en: 'Welcome message', fr: 'Message d\'accueil', de: 'Willkommensnachricht' },
    voice: { nl: 'Stem', en: 'Voice', fr: 'Voix', de: 'Stimme' },
    language: { nl: 'Taal', en: 'Language', fr: 'Langue', de: 'Sprache' },
    businessHours: { nl: 'Openingsuren', en: 'Business hours', fr: 'Heures d\'ouverture', de: 'Öffnungszeiten' },
    testCall: { nl: 'Test gesprek', en: 'Test call', fr: 'Appel test', de: 'Testanruf' },
  },

  // Settings page
  settings: {
    title: { nl: 'Instellingen', en: 'Settings', fr: 'Paramètres', de: 'Einstellungen' },
    subtitle: { nl: 'Beheer je account en bedrijfsinstellingen.', en: 'Manage your account and business settings.', fr: 'Gérez votre compte et les paramètres de l\'entreprise.', de: 'Verwalten Sie Ihre Konto- und Unternehmenseinstellungen.' },
    businessInfo: { nl: 'Bedrijfsinformatie', en: 'Business information', fr: 'Informations sur l\'entreprise', de: 'Unternehmensinformationen' },
    account: { nl: 'Account', en: 'Account', fr: 'Compte', de: 'Konto' },
    subscription: { nl: 'Abonnement', en: 'Subscription', fr: 'Abonnement', de: 'Abonnement' },
    notifications: { nl: 'Notificaties', en: 'Notifications', fr: 'Notifications', de: 'Benachrichtigungen' },
  },

  // ROI Calculator
  roi: {
    title1: { nl: 'Bereken je', en: 'Calculate your', fr: 'Calculez votre', de: 'Berechnen Sie Ihren' },
    title2: { nl: 'met VoxApp', en: 'with VoxApp', fr: 'avec VoxApp', de: 'mit VoxApp' },
    subtitle: { nl: 'Ontdek hoeveel je kunt besparen door over te stappen naar een slimme receptie. Realistische berekening op basis van werkelijke kosten.', en: 'Discover how much you can save by switching to a smart reception. Realistic calculation based on actual costs.', fr: 'Découvrez combien vous pouvez économiser en passant à une réception intelligente. Calcul réaliste basé sur les coûts réels.', de: 'Entdecken Sie, wie viel Sie sparen können, wenn Sie auf eine intelligente Rezeption umsteigen. Realistische Berechnung auf Basis tatsächlicher Kosten.' },
    currentSituation: { nl: 'Huidige Situatie', en: 'Current Situation', fr: 'Situation Actuelle', de: 'Aktuelle Situation' },
    grossSalary: { nl: 'Bruto maandsalaris receptionist(e)', en: 'Gross monthly salary receptionist', fr: 'Salaire brut mensuel réceptionniste', de: 'Bruttomonatsgehalt Rezeptionist(in)' },
    numberOfFTE: { nl: 'Aantal FTE receptionisten', en: 'Number of FTE receptionists', fr: 'Nombre d\'ETP réceptionnistes', de: 'Anzahl VZÄ Rezeptionisten' },
    calculation: { nl: 'Berekening', en: 'Calculation', fr: 'Calcul', de: 'Berechnung' },
    salaryX12: { nl: 'Bruto salaris x 12 maanden', en: 'Gross salary x 12 months', fr: 'Salaire brut x 12 mois', de: 'Bruttogehalt x 12 Monate' },
    perYear: { nl: '/jaar', en: '/year', fr: '/an', de: '/Jahr' },
    directSavings: { nl: 'Directe Jaarlijkse Besparing', en: 'Direct Annual Savings', fr: 'Économies Annuelles Directes', de: 'Direkte Jährliche Einsparungen' },
    thatsPerMonth: { nl: 'Dat is', en: 'That is', fr: 'C\'est', de: 'Das sind' },
    perMonth: { nl: 'per maand', en: 'per month', fr: 'par mois', de: 'pro Monat' },
    paybackTime: { nl: 'Terugverdientijd', en: 'Payback time', fr: 'Délai de récupération', de: 'Amortisationszeit' },
    months: { nl: 'mnd', en: 'mo', fr: 'mois', de: 'Mon' },
    costComparison: { nl: 'Kosten Vergelijking (per jaar)', en: 'Cost Comparison (per year)', fr: 'Comparaison des Coûts (par an)', de: 'Kostenvergleich (pro Jahr)' },
    withVoxApp: { nl: 'Met VoxApp', en: 'With VoxApp', fr: 'Avec VoxApp', de: 'Mit VoxApp' },
    basedOn: { nl: 'Gebaseerd op', en: 'Based on', fr: 'Basé sur', de: 'Basierend auf' },
    packageExclVat: { nl: 'pakket excl. BTW', en: 'package excl. VAT', fr: 'forfait hors TVA', de: 'Paket exkl. MwSt.' },
    extraValue: { nl: 'Extra Waarde', en: 'Extra Value', fr: 'Valeur Ajoutée', de: 'Zusätzlicher Wert' },
    availability247: { nl: '24/7 Bereikbaarheid', en: '24/7 Availability', fr: 'Disponibilité 24h/24', de: '24/7 Erreichbarkeit' },
    noVacationPlanning: { nl: 'Geen Vakantieplanning', en: 'No Vacation Planning', fr: 'Pas de planification vacances', de: 'Keine Urlaubsplanung' },
    totalExtraValue: { nl: 'Totale Extra Waarde:', en: 'Total Extra Value:', fr: 'Valeur Extra Totale:', de: 'Gesamter Zusatzwert:' },
  },

  // Outbound Section
  outbound: {
    badge: { nl: 'Uitgaande Oproepen', en: 'Outbound Calls', fr: 'Appels Sortants', de: 'Ausgehende Anrufe' },
    title: { nl: 'Verhoog boekingen en houd uw agenda vol.', en: 'Increase bookings and keep your calendar full.', fr: 'Augmentez les réservations et gardez votre agenda plein.', de: 'Steigern Sie Buchungen und halten Sie Ihren Kalender voll.' },
    subtitle: { nl: 'Uitgaande oproepen vullen uw agenda. Klanten ontvangen herinneringen, follow-ups en herboeking-verzoeken — allemaal natuurlijk en in lijn met uw merk.', en: 'Outbound calls fill your calendar. Customers receive reminders, follow-ups and rebooking requests — all naturally and in line with your brand.', fr: 'Les appels sortants remplissent votre agenda. Les clients reçoivent des rappels, des suivis et des demandes de nouvelle réservation — le tout naturellement et en accord avec votre marque.', de: 'Ausgehende Anrufe füllen Ihren Kalender. Kunden erhalten Erinnerungen, Follow-ups und Umbuchungsanfragen — alles natürlich und im Einklang mit Ihrer Marke.' },
    startFree: { nl: 'Start gratis', en: 'Start free', fr: 'Commencer gratuitement', de: 'Kostenlos starten' },
    feature1: { nl: 'Doordachte lead follow-ups', en: 'Thoughtful lead follow-ups', fr: 'Suivis de leads réfléchis', de: 'Durchdachte Lead-Follow-ups' },
    feature2: { nl: 'Terugkerende afspraken plannen', en: 'Schedule recurring appointments', fr: 'Planifier des rendez-vous récurrents', de: 'Wiederkehrende Termine planen' },
    feature3: { nl: 'Nazorg check-ins', en: 'Aftercare check-ins', fr: 'Suivis de soins', de: 'Nachsorge Check-ins' },
    feature4: { nl: 'Vriendelijke herboeking-herinneringen', en: 'Friendly rebooking reminders', fr: 'Rappels de réservation amicaux', de: 'Freundliche Umbuchungserinnerungen' },
    newBooking: { nl: 'Nieuwe boeking via VoxApp', en: 'New booking via VoxApp', fr: 'Nouvelle réservation via VoxApp', de: 'Neue Buchung über VoxApp' },
    weekOverview: { nl: 'Week Overzicht', en: 'Week Overview', fr: 'Aperçu de la Semaine', de: 'Wochenübersicht' },
    day: { nl: 'Dag', en: 'Day', fr: 'Jour', de: 'Tag' },
    week: { nl: 'Week', en: 'Week', fr: 'Semaine', de: 'Woche' },
  },

  // Automation Section
  automation: {
    badge: { nl: 'Geautomatiseerde Taken', en: 'Automated Tasks', fr: 'Tâches Automatisées', de: 'Automatisierte Aufgaben' },
    title: { nl: 'Laat administratie stilletjes op de achtergrond draaien.', en: 'Let admin tasks run quietly in the background.', fr: 'Laissez l\'administration tourner en arrière-plan.', de: 'Lassen Sie Verwaltungsaufgaben leise im Hintergrund laufen.' },
    subtitle: { nl: 'Routine boekingen, wijzigingen en follow-ups draaien automatisch — zodat uw team gefocust kan blijven op wat echt belangrijk is.', en: 'Routine bookings, changes and follow-ups run automatically — so your team can stay focused on what really matters.', fr: 'Les réservations, modifications et suivis de routine fonctionnent automatiquement — pour que votre équipe puisse rester concentrée sur ce qui compte vraiment.', de: 'Routinebuchungen, Änderungen und Follow-ups laufen automatisch — damit sich Ihr Team auf das konzentrieren kann, was wirklich wichtig ist.' },
    feature1: { nl: 'Verstuur boekingslinks automatisch', en: 'Send booking links automatically', fr: 'Envoyez des liens de réservation automatiquement', de: 'Buchungslinks automatisch versenden' },
    feature2: { nl: 'Beheer afspraakwijzigingen', en: 'Manage appointment changes', fr: 'Gérer les modifications de rendez-vous', de: 'Terminänderungen verwalten' },
    feature3: { nl: 'Route prioriteitsoproepen', en: 'Route priority calls', fr: 'Acheminer les appels prioritaires', de: 'Prioritätsanrufe weiterleiten' },
    feature4: { nl: 'Vang en koester nieuwe leads', en: 'Capture and nurture new leads', fr: 'Capturer et cultiver de nouveaux leads', de: 'Neue Leads erfassen und pflegen' },
  },

  // Try Live Section
  tryLive: {
    badge: { nl: 'Test Het Zelf', en: 'Try It Yourself', fr: 'Essayez Vous-même', de: 'Probieren Sie es selbst' },
    title: { nl: 'Bel nu met Kapsalon Belle', en: 'Call Salon Belle now', fr: 'Appelez Salon Belle maintenant', de: 'Rufen Sie jetzt Salon Belle an' },
    subtitle: { nl: 'Maak een afspraak, vraag naar prijzen, openingsuren of een specifieke medewerker. Onze receptie helpt u verder.', en: 'Make an appointment, ask about prices, opening hours or a specific employee. Our reception will help you.', fr: 'Prenez rendez-vous, demandez les prix, les horaires d\'ouverture ou un employé spécifique. Notre réception vous aidera.', de: 'Vereinbaren Sie einen Termin, fragen Sie nach Preisen, Öffnungszeiten oder einem bestimmten Mitarbeiter. Unsere Rezeption hilft Ihnen weiter.' },
    clickToCall: { nl: 'Klik om te bellen • Gratis • Geen registratie nodig', en: 'Click to call • Free • No registration needed', fr: 'Cliquez pour appeler • Gratuit • Pas d\'inscription nécessaire', de: 'Klicken zum Anrufen • Kostenlos • Keine Registrierung erforderlich' },
    connecting: { nl: 'Verbinden...', en: 'Connecting...', fr: 'Connexion...', de: 'Verbinden...' },
    speaking: { nl: 'Receptionist spreekt...', en: 'Receptionist speaking...', fr: 'Réceptionniste parle...', de: 'Rezeptionist spricht...' },
    listening: { nl: 'Receptionist luistert...', en: 'Receptionist listening...', fr: 'Réceptionniste écoute...', de: 'Rezeptionist hört zu...' },
    pleaseWait: { nl: 'Even wachten...', en: 'Please wait...', fr: 'Veuillez patienter...', de: 'Bitte warten...' },
    speakNow: { nl: 'Spreek nu, de receptionist luistert', en: 'Speak now, the receptionist is listening', fr: 'Parlez maintenant, le réceptionniste écoute', de: 'Sprechen Sie jetzt, der Rezeptionist hört zu' },
    callEnded: { nl: 'Gesprek beëindigd. Bedankt voor het testen!', en: 'Call ended. Thanks for testing!', fr: 'Appel terminé. Merci d\'avoir testé!', de: 'Anruf beendet. Danke fürs Testen!' },
    tryFor: { nl: 'Probeer bijvoorbeeld:', en: 'Try for example:', fr: 'Essayez par exemple:', de: 'Versuchen Sie zum Beispiel:' },
    example1: { nl: '"Ik wil een afspraak maken voor knippen"', en: '"I want to make an appointment for a haircut"', fr: '"Je voudrais prendre rendez-vous pour une coupe"', de: '"Ich möchte einen Termin für einen Haarschnitt machen"' },
    example2: { nl: '"Wat kost knippen en verven?"', en: '"What does a haircut and coloring cost?"', fr: '"Combien coûtent la coupe et la coloration?"', de: '"Was kostet Schneiden und Färben?"' },
    example3: { nl: '"Wat zijn de openingsuren?"', en: '"What are the opening hours?"', fr: '"Quels sont les horaires d\'ouverture?"', de: '"Was sind die Öffnungszeiten?"' },
    example4: { nl: '"Is Lisa beschikbaar donderdag?"', en: '"Is Lisa available Thursday?"', fr: '"Est-ce que Lisa est disponible jeudi?"', de: '"Ist Lisa am Donnerstag verfügbar?"' },
    example5: { nl: '"Kan ik morgen langskomen?"', en: '"Can I come by tomorrow?"', fr: '"Puis-je passer demain?"', de: '"Kann ich morgen vorbeikommen?"' },
    errorConnection: { nl: 'Kon geen verbinding maken. Controleer of je microfoon toegang hebt gegeven.', en: 'Could not connect. Check if you gave microphone access.', fr: 'Impossible de se connecter. Vérifiez si vous avez donné accès au microphone.', de: 'Verbindung nicht möglich. Prüfen Sie, ob Sie Mikrofonzugriff gewährt haben.' },
    errorGeneral: { nl: 'Er ging iets mis. Probeer het opnieuw.', en: 'Something went wrong. Please try again.', fr: 'Une erreur s\'est produite. Veuillez réessayer.', de: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.' },
  },

  // Stats Section
  stats: {
    processed: { nl: 'Verwerkt per maand', en: 'Processed per month', fr: 'Traité par mois', de: 'Verarbeitet pro Monat' },
    activeBusinesses: { nl: 'Actieve horecazaken', en: 'Active businesses', fr: 'Entreprises actives', de: 'Aktive Unternehmen' },
    uptimeGuarantee: { nl: 'Uptime garantie', en: 'Uptime guarantee', fr: 'Garantie de disponibilité', de: 'Uptime-Garantie' },
    supportAvailable: { nl: 'Support beschikbaar', en: 'Support available', fr: 'Support disponible', de: 'Support verfügbar' },
  },

  // Partners Section
  partners: {
    title: { nl: 'Onze Partners', en: 'Our Partners', fr: 'Nos Partenaires', de: 'Unsere Partner' },
  },

  // Testimonials Section
  testimonials: {
    title: { nl: 'Wat Onze Klanten Zeggen', en: 'What Our Customers Say', fr: 'Ce Que Disent Nos Clients', de: 'Was Unsere Kunden Sagen' },
    testimonial1: {
      text: { nl: '"VoxApp heeft onze klantenservice volledig getransformeerd. We missen geen enkele oproep meer en onze klanten zijn zeer tevreden met de snelle respons."', en: '"VoxApp has completely transformed our customer service. We never miss a call anymore and our customers are very satisfied with the quick response."', fr: '"VoxApp a complètement transformé notre service client. Nous ne manquons plus aucun appel et nos clients sont très satisfaits de la réponse rapide."', de: '"VoxApp hat unseren Kundenservice komplett transformiert. Wir verpassen keinen Anruf mehr und unsere Kunden sind sehr zufrieden mit der schnellen Reaktion."' },
      author: { nl: 'Mark van der Berg', en: 'Mark van der Berg', fr: 'Mark van der Berg', de: 'Mark van der Berg' },
      role: { nl: 'CEO, TechStart', en: 'CEO, TechStart', fr: 'PDG, TechStart', de: 'CEO, TechStart' },
    },
    testimonial2: {
      text: { nl: '"Het team van VoxApp heeft een perfect passend systeem voor ons gebouwd. Volledig afgestemd op onze werkwijze. Nu besparen we 30+ uur per week."', en: '"The VoxApp team has built a perfectly fitting system for us. Fully tailored to our way of working. Now we save 30+ hours per week."', fr: '"L\'équipe VoxApp a construit un système parfaitement adapté pour nous. Entièrement adapté à notre façon de travailler. Maintenant nous économisons plus de 30 heures par semaine."', de: '"Das VoxApp-Team hat ein perfekt passendes System für uns gebaut. Vollständig auf unsere Arbeitsweise abgestimmt. Jetzt sparen wir 30+ Stunden pro Woche."' },
      author: { nl: 'Sophie Janssen', en: 'Sophie Janssen', fr: 'Sophie Janssen', de: 'Sophie Janssen' },
      role: { nl: 'Operations Manager, HealthPlus', en: 'Operations Manager, HealthPlus', fr: 'Directrice des Opérations, HealthPlus', de: 'Operations Manager, HealthPlus' },
    },
    testimonial3: {
      text: { nl: '"Als tandartspraktijk ontvangen we veel afspraakverzoeken. VoxApp handelt deze perfect af, zelfs buiten kantooruren. Een absolute game-changer!"', en: '"As a dental practice we receive many appointment requests. VoxApp handles these perfectly, even outside office hours. An absolute game-changer!"', fr: '"En tant que cabinet dentaire, nous recevons de nombreuses demandes de rendez-vous. VoxApp les gère parfaitement, même en dehors des heures de bureau. Un véritable game-changer!"', de: '"Als Zahnarztpraxis erhalten wir viele Terminanfragen. VoxApp bearbeitet diese perfekt, auch außerhalb der Geschäftszeiten. Ein absoluter Game-Changer!"' },
      author: { nl: 'Dr. Peter Hendriks', en: 'Dr. Peter Hendriks', fr: 'Dr. Peter Hendriks', de: 'Dr. Peter Hendriks' },
      role: { nl: 'Eigenaar, Dental Care', en: 'Owner, Dental Care', fr: 'Propriétaire, Dental Care', de: 'Inhaber, Dental Care' },
    },
  },

  // Onboarding
  onboarding: {
    title: { nl: 'Welkom bij VoxApp!', en: 'Welcome to VoxApp!', fr: 'Bienvenue chez VoxApp!', de: 'Willkommen bei VoxApp!' },
    subtitle: { nl: 'Laten we je receptie instellen.', en: 'Let\'s set up your reception.', fr: 'Configurons votre réception.', de: 'Lassen Sie uns Ihre Rezeption einrichten.' },
    step1: { nl: 'Bedrijfsgegevens', en: 'Business details', fr: 'Détails de l\'entreprise', de: 'Unternehmensdetails' },
    step2: { nl: 'Diensten', en: 'Services', fr: 'Services', de: 'Dienste' },
    step3: { nl: 'Openingsuren', en: 'Opening hours', fr: 'Heures d\'ouverture', de: 'Öffnungszeiten' },
    step4: { nl: 'Stem kiezen', en: 'Choose voice', fr: 'Choisir une voix', de: 'Stimme wählen' },
    complete: { nl: 'Voltooien', en: 'Complete', fr: 'Terminer', de: 'Abschließen' },
    skip: { nl: 'Overslaan', en: 'Skip', fr: 'Passer', de: 'Überspringen' },
  },

  // Admin
  admin: {
    title: { nl: 'Beheerder Dashboard', en: 'Admin Dashboard', fr: 'Tableau de bord administrateur', de: 'Admin-Dashboard' },
    tenants: { nl: 'Tenants', en: 'Tenants', fr: 'Locataires', de: 'Mandanten' },
    subscriptions: { nl: 'Abonnementen', en: 'Subscriptions', fr: 'Abonnements', de: 'Abonnements' },
    settings: { nl: 'Instellingen', en: 'Settings', fr: 'Paramètres', de: 'Einstellungen' },
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
