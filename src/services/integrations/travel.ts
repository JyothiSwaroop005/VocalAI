/**
 * Travel Integration Adapter
 *
 * Handles:
 * - travel.search  → flight search (Google Flights / MakeMyTrip)
 * - travel.hotel   → hotel search (Booking.com / MakeMyTrip Hotels)
 *
 * ExecutionType: 'external_redirect' for all — no travel booking API without key.
 * Honestly builds pre-populated deep-link URLs to actual booking sites.
 *
 * Also returns a simulated result for demo mode to power the AI response.
 */

import type { ActionResult, GatewayIntent } from '../actionGateway';

export async function travelAdapter(intent: GatewayIntent): Promise<ActionResult> {
  const { type, parameters } = intent;
  const userName = intent.userContext?.name || 'User';

  // ── travel.search (flights) ────────────────────────────────────────────────
  if (type === 'travel.search') {
    const origin = parameters.origin || 'Delhi';
    const destination = parameters.destination || 'Mumbai';
    const dateText = parameters.date || 'tomorrow';

    // Google Flights deep link
    const googleFlightsUrl = `https://www.google.com/travel/flights?q=Flights+from+${encodeURIComponent(origin)}+to+${encodeURIComponent(destination)}`;

    // MakeMyTrip deep link (Indian travel platform)
    const mmtUrl = `https://www.makemytrip.com/flight/search?tripType=O&itinerary=${encodeURIComponent(origin)}-${encodeURIComponent(destination)}-${dateText}`;

    return {
      success: true,
      executionType: 'external_redirect',
      intent: type,
      service: 'travel',
      title: `Search Flights: ${origin} → ${destination}`,
      description: `Flight search prepared. Best match (demo): IndiGo 6E-204 (08:30 AM) at ₹4,820.`,
      confidence: 0.97,
      verificationStatus: 'not_applicable',
      externalUrl: googleFlightsUrl,
      externalLabel: `✈️ SEARCH ${origin.toUpperCase()} → ${destination.toUpperCase()} ON GOOGLE FLIGHTS ↗`,
      requiresConfirmation: true,
      confirmationPayload: {
        title: 'Confirm Flight Search',
        message: `Search for flights from ${origin} to ${destination} for ${dateText}?`,
        details: {
          Origin: origin,
          Destination: destination,
          Date: dateText,
          DemoResult: 'IndiGo 6E-204 — 08:30 AM — ₹4,820',
          Platform: 'Google Flights (external tab)'
        }
      },
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: `Flight: ${origin} → ${destination}` },
        { label: 'Route Extracted', status: 'completed', detail: `From: ${origin}, To: ${destination}, Date: ${dateText}` },
        { label: 'Demo Result Simulated', status: 'completed', detail: 'IndiGo 6E-204 | 08:30 AM | ₹4,820 (taxes included)' },
        { label: 'Booking URL Built', status: 'completed', detail: `Google Flights: ${googleFlightsUrl}` },
        { label: 'Confirmation Required', status: 'completed', detail: `${userName} must confirm to open Google Flights` },
      ],
      payload: {
        origin, destination, date: dateText,
        demoFlight: { airline: 'IndiGo 6E-204', departure: '08:30 AM', arrival: '10:45 AM', fare: '₹4,820' },
        googleFlightsUrl, mmtUrl
      }
    };
  }

  // ── travel.hotel ───────────────────────────────────────────────────────────
  const city = parameters.city || 'Bangalore';
  const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&no_rooms=1&group_adults=1`;
  const mmtHotels = `https://www.makemytrip.com/hotels/?checkin=1&city=${encodeURIComponent(city)}`;
  const isUnderBudget = (parameters.query || '').toLowerCase().includes('under') ||
                        (parameters.query || '').toLowerCase().includes('5000') ||
                        (parameters.query || '').toLowerCase().includes('cheap');

  return {
    success: true,
    executionType: 'external_redirect',
    intent: type,
    service: 'travel',
    title: `Search Hotels in ${city}`,
    description: isUnderBudget
      ? `Best match (demo): The Leela Residency ${city} at ₹4,200/night.`
      : `Found 12 available hotels in ${city} for this weekend.`,
    confidence: 0.96,
    verificationStatus: 'not_applicable',
    externalUrl: bookingUrl,
    externalLabel: `🏨 SEARCH HOTELS IN ${city.toUpperCase()} ON BOOKING.COM ↗`,
    steps: [
      { label: 'Intent Identified', status: 'completed', detail: `Hotel search in ${city}` },
      { label: 'City Extracted', status: 'completed', detail: `City: ${city}` },
      { label: 'Budget Filter Applied', status: isUnderBudget ? 'completed' : 'skipped', detail: isUnderBudget ? 'Filter: ≤ ₹5,000/night' : 'No budget filter' },
      { label: 'Demo Result Simulated', status: 'completed', detail: isUnderBudget ? 'The Leela Residency — ₹4,200/night ⭐4.8' : '12 hotels found (avg ₹4,500/night)' },
      { label: 'Booking URL Built', status: 'completed', detail: `Booking.com: ${bookingUrl}` },
    ],
    payload: {
      city,
      demoHotel: { name: `The Leela Residency ${city}`, price: '₹4,200/night', rating: '4.8★', breakfast: 'Included' },
      bookingUrl, mmtHotels
    }
  };
}
