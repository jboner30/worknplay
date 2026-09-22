This tool needs no sensitive data from the user. It requires the user to set a timer and enable pop-ups. 
The system is temporary; it functions as long as the user keeps it open.
The system needs memory between sessions for certain functions (e.g. the weekly screen time tracker)
No AI is needed. 
API calls may be needed to track the "Play" feature (aka the time spent on distracting websites)
If the API fails, a message will notify the user of the problem and disable features that use it. 

Break log:
9/20/26 Timer only worked when site was active. Changed this. (911d6970a8a17727ac6dbbf4bf6aeec820ed41f3) 
I pushed it past the simplest use case by letting the user go onto other sites and letting this run in the background. 
9/21/26 Changed the popup from a site message into a popup that appears even when the user is on a different site. (869f8a27ee66096715a65a177b0a244d28ed79af) 
I pushed this past the simplest use case by making an actual popup instead of a site message. 
