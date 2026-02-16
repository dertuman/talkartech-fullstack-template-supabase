import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Text,
} from '@react-email/components';

// import { getTranslationsForEmails } from '@/lib/getTranslationsForEmails';

export interface VerificationEmailProps {
  emailData: {
    email: string;
    verificationLink: string;
  };
  locale: 'en' | 'es';
}

const testingEmailData: VerificationEmailProps['emailData'] = {
  email: 'some-email@gmail.com',
  verificationLink:
    'http://localhost:3000/verify-email?token=$2a$10$0O3jH/Nu8S41HaT03cnie.SeKznF640gNoiNmITY009dk5lz3JUTq',
};

const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({
  emailData = testingEmailData,
  // locale = 'en',
}) => {
  // const t = getTranslationsForEmails(locale);

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h1" style={heading}>
              {/* {t('EmailVerification.emailVerified')} */}
              Email Verified
            </Heading>
          </Section>

          <Section style={header}>
            <Text
              style={{
                ...blockContent,
                textAlign: 'center',
              }}
            >
              {/* {t('EmailVerification.congratulations')} */}
              Congratulations
            </Text>
          </Section>

          <Section style={footer}>
            <Button href={emailData.verificationLink} style={button}>
              {/* {t('EmailVerification.confirmButton')} */}
              Confirm your account
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

const body = {
  background: '#0c0a12',
  color: 'white',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  lineHeight: '1.4',
  padding: '20px',
};
const container = {
  maxWidth: '1000px',
  margin: '0 auto',
  background: '#15131c',
  borderRadius: '6px',
  padding: '20px',
};
const header = {
  marginBottom: '30px',
};
const heading = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: 'white',
  letterSpacing: '1px',
  paddingBottom: '10px',
  textAlign: 'center' as const,
};
const blockContent = {
  color: '#C9D1D9',
  fontSize: '16px',
  paddingBottom: '5px',
};
const footer = {
  marginTop: '30px',
  textAlign: 'center' as const,
};
const button = {
  backgroundColor: '#4ccda0',
  color: '#ffffff',
  padding: '10px 20px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 'bold',
};
