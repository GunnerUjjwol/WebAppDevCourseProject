----------------------------
DATABASE INITIALIZATION QUERIES
-----
##USERS TABLE
-----

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  password CHAR(60) NOT NULL
);

------------

-----
##REPORT TABLE
reportType - '1' indicates morningReport and '2' indicates 'eveningReport'
-----
CREATE TABLE report (
  id SERIAL PRIMARY KEY,
  reportType INTEGER,
  date DATE,
  sleepDuration NUMERIC(100, 2),
  genericMood INTEGER,
  sleepQuality INTEGER,
  studyDuration NUMERIC(100,2),
  exerciseDuration NUMERIC(100,2),
  regularity INTEGER,
  user_id INTEGER REFERENCES users(id)
);


-----------------------
COMMAND TO RUN THE DENO APP
-----------------
deno run --unstable --allow-all app.js -d ${DATABASE_URL} -p ${PORT}

where DATABASE_URL must be replaced with the database
similarly, PORT can be specified by adding args "-p ${PORT}". These segment can be excluded and the port will default to 7777


-------------------------
THE DEPLOYED VERSION OF THE APP CAN BE FOUND AT
----------------------
https://web-app-dev-course-project.herokuapp.com/
---
------------------------
#+TITLE: Netsec: Summary
#+AUTHOR: Arthur Carels

Protocol overview

|-------------------------------+-----------------------+----------------------------+------------------------------+--------------------------------------|
|                               | Auth DH               | TLS                        | TLS_RSA                      | IKEv2                                |
|-------------------------------+-----------------------+----------------------------+------------------------------+--------------------------------------|
| Secret, fresh SK              | yes (nonce + DHE)     | yes, (nonce + DHE)         | if client has entropy        | yes, DH + nonces                     |
| Mutual / 1-way authentication | mutual                | only server                | mutual possible              | both ways                            |
| entity authentication         | yes                   |                            | If client authenticates      | yes mac                              |
| key confirmation              | yes                   | yes                        | yes                          | yes mac                              |
| PFS                           | yes                   | yes                        | no, public keypair of server | yes                                  |
| contributory key exchange     | yes                   | yes                        | yes, nonce                   | yes, DH                              |
| Downgrading protection        | yes, g,p unchangeable | yes, hmac                  | yes, mac                     | yes, sign covers negotation          |
| Identity protection           | no                    | server leaked, client safe | client protected if no cert  | yes                                  |
| Non-repudiation               | no                    | no                         | no                           | no                                   |
| Plausible Deniability         | no                    | no                         | yes (unauthenticated client) | no evidence of connection with other |
| DoS resistance                | yes                   | ?                          | ?                            | cookies                              |

Contributory key exchange \rightarrow no broadcasting possible!

* Network Security
** Threats and Goals
\Rightarrow protect against intentional bad things done to *communication*
    messages + communication infrastructure

Traditional threat model: *Dolev-Yao*
    end nodes = trusted
    network = attacker

Threats:
- *sniffing*
    e.g. use switches to prevent!
- *spoofing = impersonation*
    e.g. IP spoofing
    to inject spoofed packet, attacker must know the sequence numbers
- *Man in the Middle*
- *Denial of Service*: (! not in Dolev-Yao!)

  Data origin authentication and integrity check always go together
  Authentication requires an entity name or identifier

** Security and the Network Protocol Stack
Which layer should implement security mechanism?
|--------------------------------+-----------------------------------------|
| Lower                          | Higher                                  |
|--------------------------------+-----------------------------------------|
| /service/ to higher layers       | fits application requirements exactly   |
| transparent                    | deploy security faster (no "standards") |
| protects higher + "low" layers | low layer ID's may not be meaningful    |
|--------------------------------+-----------------------------------------|

Implement in IP layer \Rightarrow hour-glass shape
Security solutions exist for every layer

*End-to-end* security: all intermediaries are part of untrusted network
    independent of link technology
    confidentiality and authentication are usually user or application requirements
    \approx host is endpoint: OS must be trusted
        now \rightarrow need to think of endpoints inside a computer/datacenter

* Security protocols: basics
** Replay and Freshness
Have to include recipient id
Signature already binds id of the sender!
Ensure freshness:
    - Timestamp:  watch out for *fast replays* \rightarrow idempotent operations, sequence numbers
    - Sequence numbers \rightarrow detect message deletion, reordering & replay
    - Nonce: need random numbers + extra round trip + not for broadcast!

Summary:
Use random nonce where possible
Timestamp to limit message lifetime + sequence number for duplicate detection
Use pure sequence number only when nothing else is available (lead to complex designs)

** Classic protocol flaws
*** Needham-Schroeder secret-key protocol
Trusted third party

No freshness of ticket to B (because B never contacts the server!)
Lesson: protocol designers should assume compromise of old short-term secrets!

*** Denning-Sacco protocol
A obtains certificates from trusted server T
Signed part not bound to B's identity
Lesson: consider what is /not/ authenticated
Lesson: protocols should withstand insider attacks where a legitimate user impersonates another
*forwarding attack*

*** Needham-Schroeder public-key protocol
Lesson: consider two or more parallel protocol executions and attacker forwarding messages between them (/interleaving attack/)

*** Wide-mouth-frog protocol
Message 1 & 2 can be confused \rightarrow replay attack
Attacker can refresh timestamps & keep sessions alive forever
TTP should copy timestamp and not increment!

Lesson: use type tags in all authenticated messages to avoid accidental similarities
Lesson: Don't allow unlimited refreshing of credential / messages that should expire

*** Encrypt and sign
Lesson: in misbinding attacks, attacker causes confusion about who is communication without learning any keys or secrets herself

** Diffie-Hellman
- Modulo arithmetic
  A and B have previously agreed on generator /g/ and prime /p/
    group multiplication modulo p
    /g/ is generator
    \rightarrow choose parameters /p/ and /g/
    Exponentiation is commutative
- Elliptic curve
  A and B have previously agreed on curve and generator point /G/

Agreement:
- Standardized parameters
- One party chooses + signs parameters
- negotiation

Difficulty based on the *discrete logarithm problem*

Unauthenticated DH secure against /passive sniffing/
    vulnerable against active attacks, e.g. /impersonation/ and /MITM/
\Rightarrow authenticated DH
    \rightarrow prevents impersonation and MITM attacks
Still need to add key confirmation

Watch out for misbinding
    \Rightarrow check peer identifier!
    Sigma: detect misbinding on the receiving side, this is better!

*Ephemeral Diffie-Hellman*: session keys and data from past sessions are safe even if the long-term secrets, such as private keys are later compromised
separate concerns:
    - nonces for freshness (actually optional...)
    - DH for secrecy & new exponents for PSF
\Rightarrow *Perfect Forward Secrecy*!

** Goals of authenticated key exchange
- public keys:
    Both parties have public-private key pairs and certificates
    Goal: generate *symmetric* shared secret session key (\rightarrow efficiency)
- Shared master secret:
    Both parties share secret master key
    Goal: generate shared short-term session key
    Compromise of session key likely \rightarrow *protect* master key

*Trust roots*: Master key & certificates

*Correspondence properties / Consistency*
Algorithm *agility*: support for negotiating, upgrading & deprecating algorithms

*Identity protection*: unauthenticated DH first, then encrypt identities and certificates
    Usually only one side can have protection against active attacks

*Non-repudiation*: evidence preserved
\leftrightarrow *Plausible Deniability*: no evidence left of taking part

* TLS
** TLS 1.3 Handshake
PFS required \rightarrow old RSA handshake not supported!
only 1 RTT needed (except if key_share non supported)
    \leftrightarrow < TLS 1.2: 2 RTT's needed
! TCP + TLS 1.3 require 2 RTT's
    \leftrightarrow *QUIC*

Server can request client authentication any time, either during or after the TLS handshake

** TLS 1.3 Security Properties
Client send Server Name Indication (*SNI*) in plaintext
    \rightarrow server certificates protected against passive sniffing, but anyone can request them!
Server identity leaked, client identity well protected!

** TLS 1.3 PSK and Session Resumption
Mutual *authentication* based on a *pre-established identity and session key* (PSK)
    this instead of using certificates

!!! TLS 1.3 Session resumption = PSK mode handshake with ticket as client identity and resumption keys as the PSK
    = main purpose of PSK mode

*Session tickets* are encrypted, but can become pseudo-identifier
\rightarrow should regularly refresh the ticket

** TLS 1.3 0-RTT handshake
This is done with session resumption or PSK

Client can send early date right after the first message
Server can respond in the second message
!! TCP handshake still takes one RTT!

Security limitations:
- early data vulnerable to replay attacks (no server nonce)
- no PFS for early data
\rightarrow only ok for idempotent requests (e.g. HTTP GET)

Application must decide when to use this!

** RSA handshake (TLS 1.2 and earlier)

* Internet Key Exchange
** IKEv2
*Authenticated Key Exchange for IPSec*
    DH, sigma (sign & mac) protocol
    Minimum 2 request-response exchanges (\rightarrow 4 messages)
        IKE_SA_INIT exchange
        IKE_AUTH exchange

IKE *SA*: Security Association
Initiator I and Responder R (\leftrightarrow client & server)

SPI_{x} = values that identify the protocol run and the created IKE SA
TS_{x} = Traffic Selectors

*Authenticated Encryption* \rightarrow identity protection!

IKEv2 with pre-shared key
    CERT \rightarrow AUTH: MAC instead of a signature
IKEv2 with *EAP* (Extensible Authentication Protocol)
    = framework with many authentication methods

**  IKEv2 discussion
Identity protection: yes against passive attacks
    active: only the responder (initiator reveals identity first!)

EAP: identity protection against active attackers depends on the EAP method

prevent DDOS attack \rightarrow responder sends cookie
    COOKIE = h(K_{r}, ipaddr_{i}, ipaddr_{r})
    DDOS attack from spoofed IP address becomes impossible!
    This is done stateless \rightarrow no memory consumption

IKEv1:
    too many modes and messages \rightarrow difficult to implement

** IPsec session protocol
*ESP*: Encapsulated Security Payload
    - encryption + mac for each IP Packet
    - Optional replay protection (but TCP already takes care of this!)
Avoid:
    - ESP with encryption only
    - *AH*: Authentication Header


Session protocol modes:
- Transport mode
    host-to-host security
    ESP header added between original IP header and payload
- Tunnel mode:
    tunnels between security *gateways* to create a VPN
    entire IP packet encapsulated in new IP header + ESP header

    Host-to-gateway VPN: for mobile user back to office
        Typically, this is done with NAT traversal!

    Tunnel mode between hosts: security \approx transport mode

    Nested protection is also possible (VPN + end-to-end protection

** IPsec architecture
= *Network-layer* security protocol
- Protects IP packets between 2 hosts or gateways
- Transparent to e.g. transport layer
- IP addresses used as host identifiers


Steps:
1. IKE authenticated Key Exchange \rightarrow security associations
2. ESP session protocol protects data

*SPI*: Security Parameter Index
*SPD*: Security Policy Database
    specifies static security policy
    Policies at peer nodes have to match if they want to communicate
    ! host-to-host IPsec is problematic!
*SAD*: Security Associations Database
    Always in pairs: inbound & outbound
    Stores SAs (logic, see name...); usually created by IKE
*PAD*: Peer Authorization Database
    See next section! ref:sec:host_to_host_issues

IPsec SAs always come in pairs
    identified by *SPI*: Security Parameter Index
Node stores IPsec SAs in its SAD

Firewall and IPsec policies can be unified into one policy

** Issues with Host-to-host IPsec
\label{sec:host_to_host_issues}
Application opens connection to an IP address. IPsec uses this IP address as policy selector
Application wants to connect to specific name + IKE authenticates remote node by DNS name
Problem: no secure mapping between two identifier spaces
    \rightarrow Spoof DNS response so that hostname maps to BYPASS action
    \rightarrow IPsec policy selection depends on secure name resolution

Let's now assume secure DNS
Name resolution is done in a separate step: IKE knows the peer's IP address, not its name. The certificate only contains the name.
    Is the certificate ok?

Secure DNS does not work: only checks ownership of DNS name
Secure reverse DNS works, but does not exist

Use PAD:
    database that maps authenticated names to allowed IP addresses
But still not super great
    \rightarrow IPsec only used for VPN, TLS for host-to-host

* WLAN
** WLAN Security
*** WLAN Standards and Components
Wi-Fi alliance \rightarrow interoperability
Link layer: looks like Ethernet to layers above
    need explicit ACKS because one antenna cannot detect collisions while transmitting

Components
    - Access point *AP* = bridge
    - Wireless station *STA*
Modes
    - *Infrastructure mode*: STA only communicate with AP
    - *Ad hoc mode*: no AP

Basic Service Set *BSS*
    one AP + wireless STas
    identified by *BSSID* = AP MAC address
    \leftrightarrow *ESS*: multiple APs have same SSID
*Distribution Network*: Wired network

APs in the same ESS can belong to the same IP network segment, or to different ones

*** Joining an open WLAN
AP sends beacons (include SSID)

No authentication!
STA must specify SSID to AP  in association request \rightarrow show intention to connect

Leaving: both parties can send *Disassociation* or *Deauthentication* notification

*** Real WLAN security: WPA2:SPK
Wireless Protected Access
    = Robust Security Network *RSN*

Key Derivation Function *KDF*

** WPA3
*** Opportunistic Wireless Encryption (WPA3 Enhanced Open)
station & AP perform Diffie Hellman exchange during association
    ! this DH is *unauthenticated* !!!
    \rightarrow encryption, not authentication! (\rightarrow mitm)
PMK is derived from DH shared secret
PMK then used in 4-way handshake as before

Better then open authentication:
    - passive attacker has to be active
    - Injecting packets without mitm is impossible
    - Forward secrecy

*** WPA2 - Personal: Weakness
Attacker sniffs + stores 4-way handshake
    Guess passphrase
Unlimited offline guessing + no PFS

*** WPA3 PAKE: Dragonfly
uses Password Authenticated Key Exchanged (*PAKE*)
\rightarrow offline user cannot perform password guessing (only active guesses, but DoS protection)

Designed as balanced PAKE - both side know passphrase in plain
Fresh PMK negotiated each time, cannot be recovered even if passphrase revealed later \rightarrow forward secrecy after deleting u and v

** Enterprise Security - EAP
Extensible Authentication Protocol
    \rightarrow defines generic authentication message formats
    Security provided by authentication protocol inside EAP, not by EAP itself!
    supplicant = *peer*

User identified by network access identifier *NAI*

Authentication is performed on a centralized server (can even be in a different network!)
- *Supplicant* (STA)
- *Authentication Server* = AS
- *Authenticator* (AP)

wire: EAP encapsulated in RADIUS certificates
wireless: EAP encapsulated in EAP over LAN (*EAPOL*)

Remote access dial-in user service *RADIUS*
    define messages between Network Access Server (*NAS*) (=AP) and authentication server

*Eduroam*: user registered at home university which has radius server
    user's home institution determines the EAP authentication method

* Bluetooth Security
** Protocol STack
2 wireless technology systems:
- Basic Rate *BR*
  + 1 role
- Low Energy *LR*
  + 4 roles:
    - Broadcaster: Broadcast device advertises but does not accept connections
    - Observer: Observer listens to advertisements but does not initiate connection
    - Peripheral: Device advertises and accepts a single connection
    - Central: Initiator for all connections and can open multiple connections
  Simultaneous multiple roles

! not compatible with each other
Host in OS & Controller in chip

Generic Access Profile *GAP*
    = base profile implemented by all Bluetooth devices
    \rightarrow device discovery, connection establishment, association models and security

Advertisements are unidirectional
\leftrightarrow Connections enable bidirectional data transfer
    connection request \rightarrow data exchange \rightarrow connection establishment

Generic Attribute *GATT* profile
    \rightarrow how data is formatted & exchanged between client and server
    builds on Attribute Protocol *ATT*
        Data is structured as attributes
        Client/server role independent of master/slave
    Defines how to use ATT for discovery, reading, writing and obtaining indications

    *Services* composed of attributes
    *Profile* is composed of services and defines client/server behaviour

** Pairing, bonding & privacy
*** Pairing and bonding
Security manager defines protocols for managing pairing, authentication and encryption
BR: in chip \leftrightarrow LE in host

*Secure connections*
    support old versions for interoperability \rightarrow susceptible to downgrade attacks

Exchange I/O capabilities \rightarrow decide on association model

Phases:
- Exchange of ECDH public keys
- Authentication stage 1 and 2
- Link-key calculation

Pairing results in generation of link-key
*Bonding* \rightarrow stores a LTK after pairing for establishing future connections without pairing

*** Bluetooth LE - Privacy
no problem in classic Bluetooth!

- Public addresses:
    fixed, global
- Random addresses:
  + Static address
        static during runtime
  + Resolvable private address
        optional, changes periodically
        hash = ah(IRK,prand) || prand
  + Non-resolvable private address
        for privacy, also periodical

** Bluetooth Mesh and Secure joining
*** Bluetooth Mesh
Many-To_Many
utilize advertising \rightarrow no connections are setup

uses *publish/subscribe paradigm*

Models: \rightarrow defines functionality
- Server model
- Client model
- Control model
Scene: collection of states

Can support optional functionality, e.g.
- relay (\rightarrow TTL decrement)
- proxy: \rightarrow non-mesh devices interact with mesh network
- Low power: \rightarrow poll friend on wake-up

*Provisioning*: adding new device to mesh network
    discover new device via beacon \rightarrow send invitation
    public key exchange
    authentication: device/provisioner generate + show sth random
        then compared to see authenticity

Security: Key separation
- Application key
    \rightarrow shared by subset of nodes based on their application
- Device key
    \rightarrow shared between device & provisioner
- Network key
    \rightarrow derive network encryption key and privacy key

* NFC: expert lecture
short-range high-frequency RFID

Active device (Reader) \rightarrow generates electromagnetic field
    Proximity Coupling Device *PCD*
& Passive device (NFC tag) \rightarrow harvest power
    Proximity Integrated Circuit Card *PICC*


- Reader/Writer mode
- Card Emulation Mode
- Peer-to-Peer mode

One Time Programmable *OTP*

Memory Cards \leftrightarrow smart cards

Threats:
- Tag cloning
- Modification of tag data
- Swapping/replacing valid tags

UID can be cloned or spoofed
Cryptographic security must be defined by the NFC application!

*Relay attack* (pocket \rightarrow faraway shop)

Frame Waiting Time *FWT*: should be as small as possible
    However, often ignored!

Threats on NFC phones
- DoS attacks
- Malware delivery via NFC
Secure execution on mobile phone
- Isolate execution
    \rightarrow integrity & run-time secrecy
- Secure storage
- Remote attestation
    \rightarrow verify authenticity of application before interaction
- Secure provisioning
- Trusted path
    \rightarrow unaltered communication channel

Trusted Execution Environment *TEE*
Security Element Architecture, e.g. SIM (multi-application smart card)
    each service \rightarrow separate Security Domain \rightarrow complexity goes

Trusted Service Manager *TSM*

** NFC application
NFC Data Exchange Format *NDEF*
    message encapsulation format \rightarrow exchange messages
Signature Record Type Definition
    \rightarrow integrity & authenticity

Account-based ticketing
    Each traveller has travel account in the cloud, operated by a service provider
user device only stores user's identity and credentials
