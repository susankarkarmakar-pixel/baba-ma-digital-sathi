// A simple mock service to simulate AI responses based on common intents
// In a real application, this would call an LLM API (like OpenAI) or a custom backend.

export const handleUserQuery = async (query) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('नमस्ते') || lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
    return 'नमस्ते! मैं आपका डिजिटल साथी हूँ। बताइए, आज मैं आपकी क्या मदद कर सकता हूँ?';
  }

  if (lowerQuery.includes('दवा') || lowerQuery.includes('medicine') || lowerQuery.includes('pill')) {
    return 'मैंने आपकी दवा का अलार्म सेट कर दिया है। मैं आपको समय पर याद दिला दूंगा।';
  }

  if (lowerQuery.includes('गाना') || lowerQuery.includes('भजन') || lowerQuery.includes('song') || lowerQuery.includes('bhajan')) {
    return 'ज़रूर, मैं आपके लिए एक सुंदर भजन लगा रहा हूँ।';
  }

  if (lowerQuery.includes('कॉल') || lowerQuery.includes('फोन') || lowerQuery.includes('call') || lowerQuery.includes('phone')) {
    return 'ठीक है, मैं आपके बेटे को कॉल लगा रहा हूँ। कृपया प्रतीक्षा करें।';
  }

  if (lowerQuery.includes('खबर') || lowerQuery.includes('news') || lowerQuery.includes('समाचार')) {
    return 'आज की मुख्य खबर: मौसम सुहावना रहेगा और आज का दिन शुभ है।';
  }

  if (lowerQuery.includes('समय') || lowerQuery.includes('टाइम') || lowerQuery.includes('time')) {
    const timeString = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
    return `अभी समय ${timeString} हो रहा है।`;
  }

  // Default response
  return 'मुझे यह समझ नहीं आया, लेकिन मैं सीख रहा हूँ। क्या आप इसे दूसरे तरीके से कह सकते हैं?';
};
