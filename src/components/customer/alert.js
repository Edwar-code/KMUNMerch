import React from 'react';

export const Alert = ({ children, className }) => {
    return (
        <div className={`bg-gray-900 text-white px-3 py-2 rounded-md shadow-lg text-sm flex flex-col gap-0.5 ${className}`}>
            {children}
        </div>
    );
};

export const AlertTitle = ({ children }) => {
    return <h3 className="font-semibold text-sm leading-tight">{children}</h3>;
};

export const AlertDescription = ({ children }) => {
    return <p className="leading-snug text-xs text-gray-300">{children}</p>;
};

export const RandomAlert = () => {
    const messages = [
        "🚘 Scared? Good. You care.",
        "🚦 Relax—cars fear you too.",
        "🛑 Brake it till you make it.",
        "😂 Fear is just first gear.",
        "💨 Confidence loading…",
        "👀 Blinkers aren’t optional here!",
        "😅 No panic—just practice.",
        "😎 Future road boss detected.",
        "🫣 Nerves? Totally normal.",
        "🚗 Don’t worry, we’ve stalled too.",
        "🥴 If you’re scared, you’re ready.",
        "🧠 Overthinking kills engines.",
        "🐢 Slow is sexy here.",
        "💥 No crashes. Just courage.",
        "🧃 Sippin’ fear, servin’ skills.",
        "😂 New driver? Same drama.",
        "👏 One step closer to honking legally!",
        "🙃 Reverse isn’t a life option.",
        "🫡 We salute your fear!",
        "🎓 Driving school = bravery school.",
        "🔑 Insert courage. Turn ignition.",
        "🧘 Deep breaths. No road rage here.",
        "🚘 You got this. We promise.",
        "😆 Fear is a passenger. Drive anyway.",
        "🫥 Still scared? Perfect!",
        "😬 Confidence is contagious—catch it here.",
        "📚 Lesson 1: Don’t scream.",
        "🎯 Scared? Good. You’re learning.",
        "🐌 Fast? No. Focused? Yes.",
        "🫶 It’s okay to fear. Just don’t park there."
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return (
        <Alert className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 max-w-lg">
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>{randomMessage}</AlertDescription>
        </Alert>
    );
};
