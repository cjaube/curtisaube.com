---
title: "SAML in Progress OpenEdge"
date: 2020-08-28
category: tech
tags: 
  - "net"
  - "openedge"
  - "progress"
  - "saml"
  - "xml"
coverImage: /img/blog/message-in-a-bottle.jpeg
---

SAML is a standard that deals with authorization between identity providers (IdP) and service providers (SP). One of its primary uses is for single sign-on (SSO). OpenEdge has some SAML support built-in, but it doesn't seem to quite handle the scenario I need it to, so why not make our own SAML messages? How hard could it be?!

Turns out it's rather tricky. As the Idp, we need to make a SAML response to an SP. Now, a SAML response can be in response to an AuthnRequest, but it can also just be out of the blue (which is my use case). After a user logs in, I want them to be able to click a button and navigate to another site already logged in.

How this works is that we create a SAML response message with an assertion that includes a userId that I want to be logged in. Then we sign the message using a certificate. We then configure the SP with the public key of our certificate so that they know they can trust our certificate. The signature we provide in the message, being an encrypted version of the message, ensures that we have the private key and are therefor the owner of that certificate. This is because the message can only be encrypted with the private key, but can be decrypted with the public key.

Let's take a look at a SAML response.

```xml
<samlp:Response
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="identifier_2"
    InResponseTo="identifier_1"
    Version="2.0"
    IssueInstant="2004-12-05T09:22:05"
    Destination="https://someurl.com/saml">
    <saml:Issuer>https://IdP.example.org/SAML2</saml:Issuer>
    <samlp:Status>
      <samlp:StatusCode
        Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </samlp:Status>
    <saml:Assertion Version="2.0" ID="_aca78291-11a2-40f2-ba16-4cfbd93865db" IssueInstant="2015-08-11T21:14:33.053Z"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
    <saml:Issuer>https://IdP.example.org/SAML2</saml:Issuer>
    <Signature
        xmlns="http://www.w3.org/2000/09/xmldsig#">
        <SignedInfo>
            <CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
            <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1" />
            <Reference URI="#_aca78291-11a2-40f2-ba16-4cfbd93865db">
                <Transforms>
                    <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature" />
                    <Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#">
                        <InclusiveNamespaces PrefixList="#default saml ds xs xsi"
                            xmlns="http://www.w3.org/2001/10/xml-exc-c14n#" />
                        </Transform>
                    </Transforms>
                    <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" />
                    <DigestValue>T+64Rwm7xlNr2mTli9rU/Jmyd5o=</DigestValue>
                </Reference>
            </SignedInfo>
            <SignatureValue>WDjZhBehjVKAGLwe1nYMiQtCMspwZaDxnknn+eMk62kD08R8S4bt2nm4kTCaJ6hKxaQ/P7S5W8Kq0JIQV0pRqR+Y9m98CHtT97No6LQFbgBjlMXpEWyZbJ8zBpy5dJbUHOC3ZaFlnBrfLBxW0DR8l0mb6+uLs0VuqQm+5T606Dw=</SignatureValue>
            <KeyInfo>
                <X509Data>
               <X509Certificate>MIIBnjCCAQcCBEbTmdAwDQYJKoZIhvcNAQEEBQAwFjEUMBIGA1UEAxMLd3d3LmlkcC5jb20wHhcNMDcwODI4MDM0MzEyWhcNMTcwODI1MDM0MzEyWjAWMRQwEgYDVQQDEwt3d3cuaWRwLmNvbTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAo31q3mJZayXfZkLDuLcnanc/KG+RDFW+OlYDP+RubvWnt8X5jtiUTcp8IQ46TNEUFskmsonUb5AnG+zOCcawb2dJr8kBtCNhfi/TufZGBQNjuAxNMi34yIgRdGinaznHgclrAIIZTyKerQqYjPL1xRDsFGpzqGGi/2opzN8nV5kCAwEAATANBgkqhkiG9w0BAQQFAAOBgQBmNwFN+98aybuQKFJFr69s9BvBVYtk+Hsx3gx0g4e5sLTlkcSU03XZ8AOet0my4RvUspaDRzDrv+gEgg7gDP/rsVCSs3dkuYuUvuWbiiTq/Hj4EKuKZa8nIerZ3Oz4Xa1/bK88eT7RVsv5bMOxgJbSEvTidTvOpV0G13duIqyrCw==</X509Certificate>
                </X509Data>
            </KeyInfo>
        </Signature>
        <saml:Subject>
            <saml:NameID>aname.test</saml:NameID>
            <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                <saml:SubjectConfirmationData Recipient="https://someurl.com/saml" />
            </saml:SubjectConfirmation>
        </saml:Subject>
        <saml:Conditions NotBefore="2015-08-11T15:14:33.053Z" NotOnOrAfter="2015-08-11T15:19:33.053Z">
        </saml:Conditions>
        <saml:AuthnStatement AuthnInstant="2015-08-11T21:14:33.053Z">
            <saml:AuthnContext>
                <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:Password</saml:AuthnContextClassRef>
            </saml:AuthnContext>
        </saml:AuthnStatement>
    </saml:Assertion>
  </samlp:Response>
```

So we can see that SAML uses XML. We could use Progress OpenEdge built-in XML support, but when you start to get to the message signing part, the Progress internal libraries just don't seem to cut it. So let's switch to using .NET libraries.

We want to sign just the assertion, so the first thing we need to do is break out the SAML response and assertion and then fill in the details. We then load those into .NET XML documents.

```c
  function formatDate return char (d as datetime-tz):
    return substring(iso-date(datetime-tz(d, 0)), 1, 23) + "Z".
  end function.  

  def var samlResponse as char no-undo.
  def var samlAssertion as char no-undo.
  def var id as char no-undo.
  def var assertionId as char no-undo.
  def var issueInstant as char no-undo.
  def var expirationInstant as char no-undo.
  def var destination as char no-undo.
  def var issuer as char no-undo.
  def var assertionDoc as XmlDocument no-undo.
  def var responseDoc as XmlDocument no-undo.
  
  assign
    certificateLocation = "[The certificate file location. Example: SomeCert.pfx]"
    certificatePassword = "[The certificate password]"
    id = guid(generate-uuid)
    assertionId = guid(generate-uuid)
    issueInstant = formatDate(now)
    expirationInstant = formatDate(now + 300000)
    destination = "[The destination url. Extample: https://someurl.com/saml]"
    issuer = "[The issuer url. Esample: https://mycompany.com]".
  
  // Store the saml response and assertion
  samlResponse = '<?xml version="1.0" encoding="utf-8" ?>' +
  '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ' +
    'ID="' + id + '" Version="2.0" IssueInstant="' + issueInstant + '" Destination="' + destination + '">' +
    '<saml:Issuer>' + issuer + '</saml:Issuer>' +
    '<samlp:Status>' +
      '<samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>' +
    '</samlp:Status>' +
  '</samlp:Response>'.
  
  responseDoc = new XmlDocument().
  responseDoc:PreserveWhitespace = false.
  responseDoc:loadXml(samlResponse).
  
  samlAssertion = '<saml:Assertion Version="2.0" ID="' + assertionId + '" IssueInstant="' + issueInstant + '" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">' +
    '<saml:Issuer>' + issuer + '</saml:Issuer>' +
    '<saml:Subject>' +
      '<saml:NameID>' + username + '</saml:NameID>' +
      '<saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">' +
        '<saml:SubjectConfirmationData Recipient="' + destination + '"/>' +
      '</saml:SubjectConfirmation>' +
    '</saml:Subject>' +
    '<saml:Conditions NotBefore="' + issueInstant + '" NotOnOrAfter="' + expirationInstant + '">' +
    '</saml:Conditions>' +
    '<saml:AuthnStatement AuthnInstant="' + issueInstant + '">' +
      '<saml:AuthnContext>' +
        '<saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:Password</saml:AuthnContextClassRef>' +
      '</saml:AuthnContext>' +
    '</saml:AuthnStatement>' +
  '</saml:Assertion>'.
  
  assertionDoc = new XmlDocument().
  assertionDoc:PreserveWhitespace = false.
  assertionDoc:loadXml(samlAssertion).
```

Now that we have the SAML response and assertion, we can start working on signing the assertion.

First, we need a certificate. In my case, I used a self-signed certificate. To actually sign the assertion, there are a few steps that need to be taken:

1. Canonicalize the XML. This ensures that the next steps are consistent.
2. Compute a hash of the assertion.
3. Generate a signature by encrypting the assertion.
4. Attach the signature to the assertion.

To perform the signing I relied heavily on [a blog post about digital signatures](https://www.wiktorzychla.com/2012/12/interoperable-xml-digital-signatures-c_20.html), translating it to Progress OpenEdge with .NET libraries. _Note that that blog entry uses a different canonicalization method than what's required for SAML._

Now we need to add information about our certificate and canonicalization method. It is important to match the canonicalization to what the SP supports.

```c
  def var certificateFilename as char no-undo.
  def var certificatePassword as char no-undo.
  def var cert as X509Certificate2 no-undo.
  def var signedAssertion as SignedXml no-undo.

  assign
    certificateLocation = "SomeCert.pfx"
    certificatePassword = "somePass".

  // Get certificate
  certificateFilename = search(certificateLocation).
  cert = new X509Certificate2(certificateFilename, certificatePassword).
  
  signedAssertion = new SignedXml(assertionDoc).
  signedAssertion:SigningKey = cert:PrivateKey.

  // Specify a canonicalization method.
  signedAssertion:SignedInfo:CanonicalizationMethod = SignedXml:XmlDsigExcC14NTransformUrl.

  // Specify a canonicalization method.
  signedAssertion:SignedInfo:CanonicalizationMethod = SignedXml:XmlDsigExcC14NTransformUrl.
```

Next we need to say how we want to sign the assertion.

```c
  def var ref as Reference no-undo.
  def var env as XmlDsigEnvelopedSignatureTransform no-undo.
  def var c14t as XmlDsigExcC14NTransform no-undo.
  def var keyInfo as KeyInfo no-undo.
  def var keyInfoData as KeyInfoX509Data no-undo.
 
  
  // Create a reference to be signed.
  ref = new Reference().
  ref:Uri = "".
  
  // Add an enveloped transformation to the reference.
  env = new XmlDsigEnvelopedSignatureTransform(true).
  ref:AddTransform(env).
  
  c14t = new XmlDsigExcC14NTransform().
  ref:AddTransform(c14t).
  
  keyInfo = new KeyInfo().
  keyInfoData = new KeyInfoX509Data(cert).
  keyInfo:AddClause(keyInfoData).
  signedAssertion:KeyInfo = keyinfo.
      
  // Add the reference to the SignedXml object.
  signedAssertion:AddReference(ref).
```

Next we computer the signature.

```c
  // Compute the signature.
  signedAssertion:ComputeSignature().
```

Finally, we attach the signature to the assertion and the assertion to the SAML response.

```c
  def var xmlDigitalSignature as XmlElement no-undo.
  
  def var signedSamlResponseMemptr as memptr no-undo.
  def var signedSamlResponse as char no-undo.

  // Get the XML representation of the signature and save 
  // it to an XmlElement object.
  xmlDigitalSignature = signedAssertion:GetXml().
  
  assertionDoc:DocumentElement:InsertAfter(assertionDoc:ImportNode(xmlDigitalSignature, true), assertionDoc:DocumentElement:FirstChild).
  
  responseDoc:DocumentElement:AppendChild(responseDoc:ImportNode(assertionDoc:DocumentElement, true)).
  
  signedSamlResponse = responseDoc:OuterXml.
```

In my case, I also needed to base64 encode the SAML response. _Assuming outText is an output parameter._

```c
  // Output base-64 saml response
  set-size(signedSamlResponseMemptr) = length(signedSamlResponse,"raw") + 1.
  put-string(signedSamlResponseMemptr,1) = signedSamlResponse.
  outText = string(base64-encode(signedSamlResponseMemptr)).
  set-size(signedSamlResponseMemptr) = 0.
```

Awesome! Now we have a base64 encoded SAML response with a signed assertion! So how do we validate it? These things have to be pretty perfect to work right. You can validate your SAML response using the [validation tool at samltool.com](https://www.samltool.com/validate_response.php).

Another way of validating your SAML response is to write some code to load the signed assertion and check the signature.

```c
using System.Security.Cryptography.X509Certificates.*.
using System.Security.Cryptography.Xml.*.
using System.Xml.*.
using System.Collections.*.

def var xd as XmlDocument no-undo.
def var SignedXmlDocument as char no-undo.
def var signedXml as SignedXml no-undo.
def var nodes as XmlNodeList no-undo.
def var MessageSignatureNode as XmlNode no-undo.
def var certificate as X509Certificate2 no-undo.
def var ix as int no-undo.
def var enumerator as IEnumerator no-undo.
def var theResult as log no-undo.
def var keyInfo as KeyInfoX509Data no-undo.

SignedXmlDocument = '[The signed assertion xml]'.
  
xd = new XmlDocument().
xd:PreserveWhitespace = true.
xd:LoadXml(SignedXmlDocument).
signedXml = new SignedXml(xd).
nodes = xd:GetElementsByTagName("Signature").
MessageSignatureNode = nodes[0].
signedXml:LoadXml(cast(MessageSignatureNode, XmlElement)).
certificate = ?.
enumerator = signedXml:KeyInfo:GetEnumerator().
do while enumerator:MoveNext():
  if (type-of(enumerator:Current, KeyInfoX509Data)) then do:
    keyInfo = cast(enumerator:Current, KeyInfoX509Data).
    certificate = cast(keyInfo:Certificates[0], X509Certificate2).
  end.
end.
theResult = signedXml:CheckSignature( certificate, true ).
message string(theResult) view-as alert-box
```

And that's it! Sending SAML messages can be a bit complex, but luckily there are really good libraries that come with .NET that make it a lot easier.

Do like and comment below!
