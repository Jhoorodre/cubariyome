// src/containers/PageNotFound.js
import React from 'react';
import { useTranslation } from "react-i18next";
import Container from "../components/Container";
import Section from "../components/Section";

const PageNotFound = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <Section
        text={t("pageNotFound")}
        subText={t("pageNotFoundSubtext")}
      />
    </Container>
  );
}

export default PageNotFound;