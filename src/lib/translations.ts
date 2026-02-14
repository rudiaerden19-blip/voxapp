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
    title1: { nl: 'Mis nooit een oproep.', en: 'Never miss a call.', fr: 'Ne manquez jamais un appel.', de: 'Verpassen Sie nie einen Anruf.' },
    title2: { nl: 'Boek meer afspraken.', en: 'Book more appointments.', fr: 'Réservez plus de rendez-vous.', de: 'Buchen Sie mehr Termine.' },
    title3: { nl: 'Bespaar tijd.', en: 'Save time.', fr: 'Gagnez du temps.', de: 'Sparen Sie Zeit.' },
    subtitle: { nl: 'VoxApp beheert uw oproepen, boekt afspraken en beantwoordt vragen — zodat u kunt focussen op uw werk.', en: 'VoxApp manages your calls, books appointments and answers questions — so you can focus on your work.', fr: 'VoxApp gère vos appels, prend des rendez-vous et répond aux questions — pour que vous puissiez vous concentrer sur votre travail.', de: 'VoxApp verwaltet Ihre Anrufe, bucht Termine und beantwortet Fragen — damit Sie sich auf Ihre Arbeit konzentrieren können.' },
    tagline: { nl: 'Geen robotstemmen, maar uw eigen stem die spreekt.', en: 'No robot voices, but your own voice speaking.', fr: 'Pas de voix robotiques, mais votre propre voix qui parle.', de: 'Keine Roboterstimmen, sondern Ihre eigene Stimme.' },
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
